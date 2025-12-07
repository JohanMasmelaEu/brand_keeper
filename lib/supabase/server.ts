import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Normalizar sameSite: convertir boolean a string si es necesario
              let sameSiteValue: 'strict' | 'lax' | 'none' | undefined = undefined
              if (options?.sameSite) {
                if (typeof options.sameSite === 'string') {
                  sameSiteValue = options.sameSite as 'strict' | 'lax' | 'none'
                } else if (options.sameSite === true) {
                  sameSiteValue = 'strict'
                } else {
                  sameSiteValue = undefined
                }
              }
              
              cookieStore.set(name, value, {
                ...options,
                sameSite: sameSiteValue,
              })
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

