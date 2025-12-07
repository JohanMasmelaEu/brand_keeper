"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Verificar si hay un error en los query params (del callback)
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("No se pudo iniciar sesión. Por favor, intenta nuevamente.")
        setLoading(false)
        return
      }

      // Usar onAuthStateChange para detectar cuando la sesión esté completamente establecida
      // Esto asegura que las cookies se establezcan correctamente antes de redirigir
      await new Promise<void>((resolve, reject) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe()
              // Esperar un momento adicional para que las cookies se sincronicen
              setTimeout(() => {
                resolve()
              }, 200)
            } else if (event === 'SIGNED_OUT') {
              subscription.unsubscribe()
              reject(new Error('Sesión no establecida'))
            }
          }
        )
        
        // Timeout de seguridad
        setTimeout(() => {
          subscription.unsubscribe()
          // Verificar sesión directamente como fallback
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              resolve()
            } else {
              reject(new Error('Timeout esperando sesión'))
            }
          })
        }, 2000)
      })

      // Forzar una recarga completa para que el middleware detecte la sesión
      // El middleware se encargará de redirigir al dashboard correcto
      window.location.href = "/"
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Login error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
      setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 px-4 pt-6 sm:px-6 sm:pt-8">
          <CardTitle className="text-2xl font-bold sm:text-3xl">Brand Keeper</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Inicia sesión en tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6 sm:pb-8">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 px-4 pt-6 sm:px-6 sm:pt-8">
            <CardTitle className="text-2xl font-bold sm:text-3xl">Brand Keeper</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Cargando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

