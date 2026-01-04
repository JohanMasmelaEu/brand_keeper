import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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

/**
 * Crea un cliente de Supabase con permisos de administrador (service role)
 * Solo debe usarse en API routes o funciones server-side que requieren permisos elevados
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

