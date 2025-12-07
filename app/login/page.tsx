"use client"

import { useEffect, useState, Suspense, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Iridescence from "@/components/animations/iridescent-background"
import Image from "next/image"
import { LogIn } from "lucide-react"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { loginSchema } from "@/lib/validations/schemas"
import { PageLoader } from "@/components/ui/page-loader"

// Componente separado y memoizado para la animación para evitar re-renderizados
const AnimationSection = memo(function AnimationSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <Iridescence
        color={[0, 1, 0.8]}
        speed={1.7}
        amplitude={0.1}
        mouseReact={true}
      />
      {/* Logo Samtel centrado */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-w-md px-8">
          <Image
            src="/images/LOGO_CORE_LOGIN.png"
            alt="Samtel Logo"
            width={400}
            height={200}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
})

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Detectar cuando todos los elementos están cargados
  useEffect(() => {
    const checkPageLoaded = () => {
      // Verificar que la página esté completamente cargada
      if (document.readyState === "complete") {
        // Esperar un momento adicional para que las animaciones y recursos se carguen
        const timer = setTimeout(() => {
          setIsPageLoading(false)
        }, 800)
        return () => clearTimeout(timer)
      }
    }

    // Si ya está cargado
    if (document.readyState === "complete") {
      checkPageLoaded()
    } else {
      window.addEventListener("load", checkPageLoaded)
      return () => window.removeEventListener("load", checkPageLoaded)
    }
  }, [])

  // Hook personalizado para manejo de formularios con validación
  const { form, onSubmit, isSubmitting, error, setError } = useFormValidation({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      const supabase = createClient()
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (!signInData.user) {
        throw new Error("No se pudo iniciar sesión. Por favor, intenta nuevamente.")
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
    },
  })

  // Verificar si hay un error en los query params (del callback)
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams, setError])

  return (
    <>
      <PageLoader isLoading={isPageLoading} />
      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <Card className="w-full max-w-lg border-0">
          <CardHeader className="space-y-2 px-6 pt-8 sm:px-8 sm:pt-10">
            <CardTitle className="text-4xl font-bold sm:text-5xl text-center">Brand Keeper</CardTitle>
            <CardDescription className="text-base sm:text-lg text-center">
              Inicia sesión en tu cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 sm:px-8 sm:pb-10">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base sm:text-lg font-medium">
                        Correo electrónico
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          disabled={isSubmitting}
                          className="h-12 sm:h-14 text-base sm:text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base sm:text-lg font-medium">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className="h-12 sm:h-14 text-base sm:text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="rounded-md bg-destructive/15 p-4 text-base text-destructive">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-lg sm:text-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary" 
                  style={{ 
                    backgroundColor: 'hsl(var(--primary))', 
                    color: 'white',
                  }}
                  disabled={isSubmitting}
                >
                  <LogIn className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 hover:translate-x-1" />
                  {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Animación fuera del formulario para evitar re-renderizados */}
      <AnimationSection />
      <Suspense fallback={
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
          <Card className="w-full max-w-lg border-0">
            <CardHeader className="space-y-2 px-6 pt-8 sm:px-8 sm:pt-10">
              <CardTitle className="text-4xl font-bold sm:text-5xl text-center">Brand Keeper</CardTitle>
              <CardDescription className="text-base sm:text-lg text-center">
                Cargando...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

