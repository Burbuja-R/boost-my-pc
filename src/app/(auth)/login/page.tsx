import { Metadata } from "next"
import { LoginForm } from "@/presentation/components/auth/login-form"

export const metadata: Metadata = {
  title: "Iniciar Sesión | Boost My PC",
  description: "Inicia sesión en tu cuenta de Boost My PC para optimizar el rendimiento de tu sistema.",
}

export default function LoginPage() {
  return <LoginForm />
} 