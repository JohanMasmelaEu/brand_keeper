/**
 * Utilidades para envío de correos electrónicos
 */

import { getAppUrl } from "./env"
import { Resend } from "resend"

/**
 * Envía un correo de bienvenida con la contraseña y link de login
 * @param email Correo electrónico del destinatario
 * @param password Contraseña generada
 * @param fullName Nombre completo del usuario (opcional)
 */
export async function sendWelcomeEmail(
  email: string,
  password: string,
  fullName?: string | null
): Promise<void> {
  const appUrl = getAppUrl()
  const loginUrl = `${appUrl}/login`
  
  const userName = fullName || email.split('@')[0]
  
  const subject = "Bienvenido a Brand Keeper - Credenciales de acceso"
  
  // URL del logo: usar variable de entorno si está configurada, sino usar URL local como fallback
  // Para usar Google Drive u otro servicio, configura EMAIL_LOGO_URL en .env.local
  // Ejemplo: EMAIL_LOGO_URL=https://drive.google.com/uc?export=view&id=TU_FILE_ID
  const logoUrl = process.env.EMAIL_LOGO_URL || `${appUrl}/images/LOGO_CORE_LOGIN.png`
  
  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🖼️ URL del logo para correo: ${logoUrl}`)
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Brand Keeper</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Encabezado con logo y fondo secundario -->
      <div style="background-color: #212726; padding: 30px; border-radius: 8px 8px 0 0; margin-bottom: 0; text-align: center;">
        <img 
          src="${logoUrl}" 
          alt="Brand Keeper Logo" 
          width="200" 
          height="auto"
          style="max-width: 200px; width: 200px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; border: 0; outline: none; text-decoration: none;" 
        />
        <h1 style="color: #bcf352; margin-top: 0; margin-bottom: 0; font-size: 28px;">¡Bienvenido a Brand Keeper!</h1>
      </div>
      
      <!-- Contenido principal -->
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
        <p>Hola ${userName},</p>
        <p>Tu cuenta ha sido creada exitosamente en Brand Keeper. A continuación encontrarás tus credenciales de acceso:</p>
      </div>
      
      <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Credenciales de Acceso</h2>
        <p><strong>Correo electrónico:</strong> ${email}</p>
        <p><strong>Contraseña temporal:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${password}</code></p>
        <p style="color: #dc2626; font-size: 14px; margin-top: 10px;">
          <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar esta contraseña después de tu primer inicio de sesión.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #bcf352; color: #212726; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Iniciar Sesión
        </a>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0;"><strong>Link de acceso directo:</strong></p>
        <p style="margin: 5px 0 0 0; word-break: break-all;"><a href="${loginUrl}" style="color: #bcf352;">${loginUrl}</a></p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        <p>Si no solicitaste esta cuenta, por favor contacta al administrador del sistema.</p>
      </div>
    </body>
    </html>
  `
  
  const textContent = `
¡Bienvenido a Brand Keeper!

Hola ${userName},

Tu cuenta ha sido creada exitosamente en Brand Keeper. A continuación encontrarás tus credenciales de acceso:

Credenciales de Acceso:
- Correo electrónico: ${email}
- Contraseña temporal: ${password}

⚠️ Importante: Por seguridad, te recomendamos cambiar esta contraseña después de tu primer inicio de sesión.

Link de acceso: ${loginUrl}

Este es un correo automático, por favor no respondas a este mensaje.
Si no solicitaste esta cuenta, por favor contacta al administrador del sistema.
  `
  
  // Intentar enviar correo usando Resend si está configurado
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (resendApiKey && resendApiKey !== 'your_resend_api_key') {
    try {
      // Verificar que la API key no tenga espacios o caracteres extra
      const cleanApiKey = resendApiKey.trim()
      
      // Log temporal para debugging (solo muestra los primeros y últimos caracteres por seguridad)
      const maskedKey = cleanApiKey.length > 10 
        ? `${cleanApiKey.substring(0, 5)}...${cleanApiKey.substring(cleanApiKey.length - 5)}`
        : '***'
      console.log(`🔑 Intentando usar API key de Resend: ${maskedKey} (longitud: ${cleanApiKey.length})`)
      
      if (!cleanApiKey.startsWith('re_')) {
        throw new Error('La API key de Resend debe comenzar con "re_"')
      }
      
      const resend = new Resend(cleanApiKey)
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      
      // Enviar correo siguiendo la documentación oficial de Resend
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [email], // Usar array como en la documentación oficial
        subject: subject,
        html: htmlContent,
        text: textContent, // Agregar versión de texto para mejor compatibilidad
      })
      
      // Validar la respuesta de Resend según la documentación oficial
      if (error) {
        const errorMessage = error.message || 'Error desconocido al enviar correo'
        console.error('❌ Error de Resend API:', error)
        
        // Manejar error específico de dominio no verificado
        if (errorMessage.includes('can only send testing emails to your own email address')) {
          const userEmail = errorMessage.match(/\(([^)]+)\)/)?.[1] || 'tu email'
          throw new Error(
            `⚠️ Limitación de Resend: Solo puedes enviar correos de prueba a ${userEmail} cuando usas el dominio de prueba (onboarding@resend.dev). ` +
            `Para enviar a otros destinatarios, verifica un dominio en https://resend.com/domains y actualiza RESEND_FROM_EMAIL en .env.local`
          )
        }
        
        // Manejar error de dominio no verificado
        if (errorMessage.includes('domain is not verified') || errorMessage.includes('not verified')) {
          const domainMatch = errorMessage.match(/The ([^\s]+) domain/)
          const domain = domainMatch ? domainMatch[1] : 'el dominio'
          throw new Error(
            `⚠️ Dominio no verificado: El dominio ${domain} no está verificado en Resend. ` +
            `Ve a https://resend.com/domains para verificar tu dominio, o usa temporalmente el dominio de prueba: ` +
            `RESEND_FROM_EMAIL=Brand Keeper <onboarding@resend.dev>`
          )
        }
        
        throw new Error(`Error al enviar correo: ${errorMessage}`)
      }
      
      if (!data || !data.id) {
        console.error('❌ Respuesta inválida de Resend - data:', data)
        throw new Error('Error: Respuesta inválida del servicio de correo')
      }
      
      console.log(`✅ Correo de bienvenida enviado a ${email} (ID: ${data.id})`)
      return
    } catch (error) {
      console.error('❌ Error enviando correo con Resend:', error)
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('API key is invalid') || error.message.includes('401')) {
          throw new Error('API key de Resend inválida. Verifica que la clave en .env.local sea correcta y que el servidor se haya reiniciado después de cambiarla.')
        }
        throw error
      }
      
      // Lanzar el error para que el llamador pueda manejarlo
      throw new Error('Error desconocido al enviar correo con Resend')
    }
  }
  
  // Fallback: mostrar en consola (desarrollo o si Resend no está configurado)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 ==========================================')
    console.log('📧 CORREO DE BIENVENIDA (DESARROLLO)')
    console.log('📧 ==========================================')
    console.log(`📧 Para: ${email}`)
    console.log(`📧 Asunto: ${subject}`)
    console.log(`📧 Contraseña: ${password}`)
    console.log(`📧 Link de login: ${loginUrl}`)
    console.log('📧 ==========================================')
    console.log('📧 NOTA: Para enviar correos reales, configura RESEND_API_KEY en .env.local')
    console.log('📧 ==========================================\n')
  } else {
    // En producción sin Resend configurado
    const errorMessage = `No se pudo enviar correo a ${email}. RESEND_API_KEY no está configurado.`
    console.warn(`⚠️ [PRODUCTION] ${errorMessage}`)
    console.warn(`⚠️ Contraseña generada: ${password}`)
    throw new Error(errorMessage)
  }
}

