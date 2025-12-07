/**
 * Utilidades para manejo de variables de entorno
 * Asegura que las variables estén disponibles y validadas
 */

/**
 * Obtiene la URL base de la aplicación según el entorno
 * En desarrollo: usa NEXT_PUBLIC_APP_URL o localhost:3000
 * En producción: usa NEXT_PUBLIC_APP_URL o la URL de Vercel
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    // Cliente: usar la URL actual
    return window.location.origin
  }

  // Servidor: usar variable de entorno o fallback
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )
}

/**
 * Valida que las variables de entorno de Supabase estén configuradas
 * @throws Error si faltan variables críticas
 */
export function validateSupabaseEnv(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no está configurada. Por favor, configura esta variable en .env.local"
    )
  }

  if (!supabaseAnonKey || supabaseAnonKey === "your_supabase_anon_key") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada. Por favor, configura esta variable en .env.local"
    )
  }
}

/**
 * Obtiene la URL de Supabase validada
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url === "your_supabase_project_url") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurada")
  }
  return url
}

/**
 * Obtiene la clave anónima de Supabase validada
 */
export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key || key === "your_supabase_anon_key") {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada")
  }
  return key
}

