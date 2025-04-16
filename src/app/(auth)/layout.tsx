import { type ReactNode } from 'react'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Panel izquierdo: Formulario */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Image
              src="/next.svg"
              alt="Logo"
              width={120}
              height={30}
              className="mx-auto mb-6 dark:invert"
              priority
            />
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Boost My PC
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Optimiza el rendimiento de tu PC con unos pocos clics
            </p>
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Panel derecho: Imagen decorativa (solo en dispositivos medianos y grandes) */}
      <div className="hidden md:block bg-gray-100 dark:bg-gray-900 relative">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="max-w-lg space-y-4 text-center">
            <h3 className="text-2xl font-semibold">
              Mejora el rendimiento de tu sistema
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Escanea tu PC, recibe recomendaciones personalizadas y aplica optimizaciones con unos pocos clics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 