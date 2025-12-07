/**
 * Utilidades para configuración segura de cookies
 * 
 * Este módulo proporciona funciones para asegurar que las cookies
 * se configuren con las mejores prácticas de seguridad.
 */

/**
 * Obtiene las opciones de seguridad para cookies según el entorno
 */
export function getSecureCookieOptions(): {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  path: string
} {
  const isProduction = process.env.NODE_ENV === 'production'
  const isHTTPS = 
    process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ||
    process.env.VERCEL_ENV === 'production'

  return {
    // httpOnly: true previene acceso desde JavaScript (protección XSS)
    // NOTA: Las cookies del cliente (createBrowserClient) no pueden ser httpOnly
    // porque necesitan ser accesibles desde JavaScript. Esto es un trade-off
    // aceptable ya que Supabase maneja la seguridad del token internamente.
    httpOnly: false, // Debe ser false para cookies del cliente, true para server-only
    
    // secure: true solo permite transmisión por HTTPS
    // En desarrollo local (HTTP) debe ser false, en producción (HTTPS) debe ser true
    secure: isProduction && isHTTPS,
    
    // sameSite: 'lax' previene CSRF mientras permite navegación normal
    // 'strict' es más seguro pero puede romper flujos de OAuth
    sameSite: 'lax',
    
    // path: '/' asegura que la cookie esté disponible en todo el dominio
    path: '/',
  }
}

/**
 * Aplica opciones de seguridad a las cookies de autenticación
 */
export function applySecureCookieOptions(
  options?: {
    path?: string
    domain?: string
    maxAge?: number
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
): {
  path: string
  domain?: string
  maxAge?: number
  expires?: Date
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
} {
  const secureDefaults = getSecureCookieOptions()
  
  return {
    path: options?.path || secureDefaults.path,
    domain: options?.domain, // No establecer domain por defecto (más seguro)
    maxAge: options?.maxAge,
    expires: options?.expires,
    httpOnly: options?.httpOnly ?? secureDefaults.httpOnly,
    secure: options?.secure ?? secureDefaults.secure,
    sameSite: options?.sameSite || secureDefaults.sameSite,
  }
}

/**
 * Valida que las cookies de autenticación tengan configuraciones seguras
 * (solo para uso en desarrollo/testing)
 */
export function validateCookieSecurity(cookieName: string, options: {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}): void {
  if (process.env.NODE_ENV === 'development') {
    const warnings: string[] = []
    
    if (cookieName.startsWith('sb-') && options.httpOnly === false) {
      // Esto es esperado para cookies del cliente, no es un warning
    }
    
    if (process.env.NODE_ENV === 'production' && !options.secure) {
      warnings.push(`Cookie ${cookieName} debe tener secure=true en producción`)
    }
    
    if (!options.sameSite || options.sameSite === 'none') {
      warnings.push(`Cookie ${cookieName} debe tener sameSite='lax' o 'strict'`)
    }
    
    if (warnings.length > 0) {
      console.warn('[Security] Cookie security warnings:', warnings)
    }
  }
}

