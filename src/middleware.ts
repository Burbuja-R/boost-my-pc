import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // No ejecutes código entre createServerClient y
  // supabase.auth.getUser(). Un simple error podría hacer muy difícil depurar
  // problemas con usuarios que se desconectan aleatoriamente.

  // IMPORTANTE: NO ELIMINES auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/register')
  ) {
    // sin usuario, potencialmente responder redirigiendo al usuario a la página de inicio de sesión
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: DEBES devolver el objeto supabaseResponse tal como está.
  // Si estás creando un nuevo objeto de respuesta con NextResponse.next() asegúrate de:
  // 1. Pasar la solicitud en él, así:
  // const miNuevaRespuesta = NextResponse.next({ request })
  // 2. Copiar las cookies, así:
  // miNuevaRespuesta.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Cambiar el objeto miNuevaRespuesta para que se ajuste a tus necesidades, pero evita cambiar
  // las cookies!
  // 4. Finalmente:
  // return miNuevaRespuesta
  // Si esto no se hace, puedes estar causando que el navegador y el servidor se desincronicen
  // y terminen prematuramente la sesión del usuario!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     * Siéntete libre de modificar este patrón para incluir más rutas.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
