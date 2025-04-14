# 🧠 App Context - Optimizer Web App (Next.js 15 + Supabase)

Esta es una aplicación web que ayuda a optimizar el rendimiento del PC del usuario. Debido a las limitaciones del entorno del navegador, no se pueden aplicar directamente cambios en el sistema operativo del usuario desde Node.js. En lugar de eso, la aplicación se basa en la generación de archivos ejecutables (.reg, .bat, .ps1, .vbs) y recomendaciones basadas en el hardware y configuración del PC escaneado. A continuación se detallan los objetivos y funcionamiento de cada capa de la aplicación.

---

## 🔒 1. Autenticación de Usuarios

- Se utiliza **Supabase Auth** para gestionar el registro, inicio de sesión y almacenamiento de usuarios.
- Se utiliza **Shadcn** para todo el tema visual, usaremos sus componentes siempre que sea posible.
- Al momento del registro se usará un **stepper** para recopilar información inicial adicional como:
  - Nombre de usuario
  - Foto de perfil (desde Google, subida personalizada o asignada aleatoriamente)
  - Contraseña
  - Aceptación de términos y políticas

## 🖥️ 2. Escaneo obligatorio del PC (Hardware y Red)

- Esta etapa es **obligatoria** y debe completarse justo después del login. El usuario no podrá acceder a la aplicación principal si no ha realizado su primer escaneo.
- El escaneo se realiza utilizando librerías como `systeminformation`, y extrae información detallada del hardware:
  - CPU, GPU, RAM, almacenamiento
  - Placa base
  - Sistema operativo
  - Dispositivos de red: conexión, interfaz, MAC, IP, velocidad, estado, etc.
- Toda la información se sube y almacena en **Supabase**.
- Para evitar que el usuario repita este paso constantemente:
  - Se incluye un campo `has_scanned_pc: boolean` en el modelo de usuario.
  - Esta variable evitará mostrar la pantalla de escaneo si ya se ha completado.
- El usuario puede optar por:
  - Editar manualmente los datos desde su perfil.
  - Re-escanear el sistema en cualquier momento para actualizar los datos.

## 🛠️ 3. Recomendación y Aplicación de Tweaks

- Una vez escaneado el PC, la app recomendará tweaks en base al sistema del usuario.
- Los tweaks se generan como **archivos descargables (.reg, .bat, .ps1, .vbs)** usando Blob.
- El contenido de los tweaks es **raw**, por ejemplo:

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\PriorityControl]
"ConvertibleSlateMode"=dword:00000000
"Win32PrioritySeparation"=dword:00000026
```

- Estos archivos son seguros y creados localmente en el navegador para que el usuario los ejecute por su cuenta.

---

## 📄 Información de la Base de Datos (Supabase)

### 👤 Usuario
- `id`
- `username`
- `email`
- `profile_image_url`
- `created_at`
- `role`: "admin" o "user_normal"
- `limited_req`: cantidad de tweaks que puede solicitar por mes (25 por defecto)
- `has_scanned_pc`: boolean (define si el usuario ya escaneó su sistema)
- `pc_specs`: JSON con la info del escaneo
- `tweaks_used`: relación con tweaks descargados o utilizados

### 🧩 Tweak
- `id`
- `title`
- `description`
- `category/page`: ej. "security"
- `content_raw`: contenido del tweak
- `file_type`: ".reg", ".bat", ".ps1", ".vbs"
- `downloaded_by`: lista de usuarios que lo descargaron
- `created_at`, `updated_at`
- `is_disabled`: por defecto `false`
- `tweak_icon` (opcional)
- `file_icon`: icono por defecto si no hay uno personalizado
- `hasTweakCustomIcon`: boolean

---

## ⚙️ Arquitectura General (Clean Architecture)

```
src/
│
├── app/                        # Rutas y layouts de Next.js 15
│   ├── (auth)/                 # Páginas públicas (login, register, etc.)
│   ├── (dashboard)/            # Layout protegido para usuarios autenticados
│   └── page.tsx                # Landing page
│
├── entities/                   # Dominio (tipos, reglas de negocio puras)
│   ├── user.ts                 # Entidad Usuario
│   ├── tweak.ts                # Entidad Tweak
│   └── enums.ts                # Enums globales (roles, tipo de archivo, etc.)
│
├── usecases/                  # Casos de uso (acciones principales)
│   ├── user/
│   │   ├── createUser.ts
│   │   ├── updateUserSpecs.ts
│   │   └── getUserTweaks.ts
│   ├── tweak/
│   │   ├── createTweak.ts
│   │   ├── approveTweak.ts
│   │   ├── getTweakById.ts
│   │   └── downloadTweak.ts
│   └── shared/
│       └── validateRequestLimit.ts
│
├── infrastructure/            # Adaptadores e infraestructura externa
│   ├── supabase/              # Funciones para interactuar con Supabase
│   │   ├── client.ts          # Cliente Supabase
│   │   ├── users.ts
│   │   ├── tweaks.ts
│   │   └── downloads.ts
│   ├── system/                # Lógica relacionada con escaneo del PC
│   │   └── scanSpecs.ts       # (mock o desde Electron/Bridge si se hace nativo)
│
├── presentation/              # Componentes de UI y lógica visual
│   ├── components/            # Componentes reutilizables
│   │   ├── UserCard.tsx
│   │   ├── TweakCard.tsx
│   │   └── TweakDownloadModal.tsx
│   ├── pages/                 # Páginas organizadas por dominio
│   │   ├── tweaks/
│   │   └── users/
│   └── hooks/                 # Custom React hooks
│       ├── useTweakForm.ts
│       └── useUserProfile.ts
│
├── shared/                    # Utilidades y constantes
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── validateTweak.ts
│   │   └── fileHelpers.ts
│   ├── icons/                 # Iconos de lucide-react
│   └── constants.ts           # Constantes globales (ej. límites por rol)
│
├── middleware.ts              # Middleware de Next.js (protección de rutas)
├── types/                     # Tipos globales si no están en entities/
└── styles/                    # Estilos globales con Tailwind o CSS Modules
    └── globals.css
```

---

## ✅ Flujo General del Usuario

1. Registro/Login con Supabase → Paso obligatorio por el **stepper** de registro
2. Escaneo completo del PC → Se almacena en Supabase y marca `has_scanned_pc = true`
3. Acceso a la app principal
4. Recomendación de tweaks
5. El usuario descarga y aplica tweaks localmente en su sistema

> Esta estructura está diseñada para ser fácilmente extensible, segura y óptima para manejar datos técnicos del sistema del usuario sin comprometer la experiencia de usuario ni la integridad del navegador.