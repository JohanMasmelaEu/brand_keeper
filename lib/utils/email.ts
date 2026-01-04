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
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Brand Keeper</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin-top: 0;">¡Bienvenido a Brand Keeper!</h1>
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
        <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Iniciar Sesión
        </a>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0;"><strong>Link de acceso directo:</strong></p>
        <p style="margin: 5px 0 0 0; word-break: break-all;"><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
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
      const resend = new Resend(resendApiKey)
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      })
      
      console.log(`✅ Correo de bienvenida enviado a ${email}`)
      return
    } catch (error) {
      console.error('❌ Error enviando correo con Resend:', error)
      // Continuar para mostrar en consola como fallback
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
    console.warn(`⚠️ [PRODUCTION] No se pudo enviar correo a ${email}. Configura RESEND_API_KEY para habilitar el envío de correos.`)
    console.warn(`⚠️ Contraseña generada: ${password}`)
  }
}

