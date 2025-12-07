import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/utils/env'

export async function updateSession(request: NextRequest) {
  // Validar que las variables de entorno estén configuradas
  let supabaseUrl: string
  let supabaseAnonKey: string

  try {
    supabaseUrl = getSupabaseUrl()
    supabaseAnonKey = getSupabaseAnonKey()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error de configuración:', errorMessage)
    console.error('   Por favor, configura las variables de entorno en .env.local')
    console.error('   Consulta context/SUPABASE_SETUP.md para más información')
    return NextResponse.json(
      { 
        error: 'Configuración de Supabase faltante',
        message: errorMessage
      },
      { status: 500 }
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const isProduction = process.env.NODE_ENV === 'production'
          const isHTTPS = request.url.startsWith('https://')
          
          // Actualizar las cookies en el request
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          // Crear nueva respuesta con las cookies actualizadas
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Aplicar configuraciones de seguridad a las cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            // Para cookies de autenticación de Supabase, aplicar seguridad
            const isAuthCookie = name.startsWith('sb-') && name.includes('auth')
            
            // Normalizar sameSite: convertir boolean a string si es necesario
            let sameSiteValue: 'strict' | 'lax' | 'none' | undefined = 'lax'
            if (options?.sameSite) {
              if (typeof options.sameSite === 'string') {
                sameSiteValue = options.sameSite as 'strict' | 'lax' | 'none'
              } else if (options.sameSite === true) {
                sameSiteValue = 'strict'
              } else {
                sameSiteValue = 'lax'
              }
            }
            
            supabaseResponse.cookies.set(name, value, {
              path: options?.path || '/',
              domain: options?.domain,
              maxAge: options?.maxAge,
              expires: options?.expires,
              httpOnly: options?.httpOnly ?? (isAuthCookie ? true : false),
              secure: options?.secure ?? (isProduction && isHTTPS),
              sameSite: sameSiteValue,
            })
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Refrescar la sesión primero para asegurar que las cookies se sincronicen
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Log simplificado para desarrollo
  if (process.env.NODE_ENV === 'development') {
    const path = request.nextUrl.pathname
    if (user) {
      console.log(`✓ ${path} → ${user.id.substring(0, 8)}...`)
    } else if (path !== '/login' && path !== '/auth' && !path.startsWith('/_next')) {
      console.log(`→ ${path} (no auth)`)
    }
    
    // Solo mostrar errores relevantes
    if (userError && !userError.message.includes('session missing')) {
      console.error(`❌ Auth: ${userError.message}`)
    }
    if (sessionError && !sessionError.message.includes('session missing')) {
      console.error(`❌ Session: ${sessionError.message}`)
    }
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Función helper para obtener el perfil y redirigir
  const redirectToDashboard = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (profileError) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Profile error: ${profileError.message}`)
        }
        return null
      }

      if (!profile) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠ No profile found for user: ${userId.substring(0, 8)}...`)
        }
        return null
      }

      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'

      if (process.env.NODE_ENV === 'development') {
        console.log(`→ Redirect: ${url.pathname}`)
      }

      const redirectResponse = NextResponse.redirect(url)
      // Copiar todas las cookies de la respuesta de Supabase con seguridad mejorada
      const isProduction = process.env.NODE_ENV === 'production'
      const isHTTPS = request.url.startsWith('https://')
      
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        const isAuthCookie = cookie.name.startsWith('sb-') && cookie.name.includes('auth')
        
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path || '/',
          domain: cookie.domain, // No establecer domain por defecto (más seguro)
          maxAge: cookie.maxAge,
          expires: cookie.expires,
          // Asegurar httpOnly para cookies de autenticación
          httpOnly: cookie.httpOnly ?? (isAuthCookie ? true : false),
          // Asegurar secure en producción con HTTPS
          secure: cookie.secure ?? (isProduction && isHTTPS),
          // Asegurar sameSite para prevenir CSRF
          sameSite: (cookie.sameSite || 'lax') as 'strict' | 'lax' | 'none',
        })
      })
      return redirectResponse
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Redirect error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      return null
    }
  }

  // Si el usuario está autenticado y está en /login, redirigir al dashboard
  if (user && request.nextUrl.pathname === '/login') {
    const redirect = await redirectToDashboard(user.id)
    if (redirect) {
      return redirect
    }
  }

  // Si el usuario está autenticado y está en la raíz, redirigir según su rol
  if (user && request.nextUrl.pathname === '/') {
    const redirect = await redirectToDashboard(user.id)
    if (redirect) {
      return redirect
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

