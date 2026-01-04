# Configuración de Envío de Correos Electrónicos

## ¿Qué es un "Servicio de Correo"?

Un **servicio de correo** es una plataforma externa que se encarga de enviar correos electrónicos reales desde tu aplicación. 

### ¿Por qué necesitamos uno?

- **Node.js/Next.js NO puede enviar correos directamente**: Tu servidor no tiene la capacidad nativa de enviar correos
- **Evita que tus correos sean marcados como spam**: Los servicios profesionales tienen mejor reputación
- **Garantiza la entrega**: Manejan la infraestructura compleja de envío de correos

### Situación Actual

**En Desarrollo (localhost):**
- Los correos NO se envían realmente
- La contraseña se muestra en la consola del servidor
- Esto es suficiente para desarrollo y pruebas

**En Producción (Vercel):**
- Sin servicio configurado: Los correos NO se envían, solo se registran en logs
- Con servicio configurado: Los correos SÍ se envían a los usuarios reales

## Opción Recomendada: Resend

**Resend** es un servicio moderno y fácil de usar para enviar correos desde aplicaciones.

### Ventajas:
- ✅ **Gratis hasta 3,000 correos/mes**
- ✅ Fácil de configurar
- ✅ Buena reputación (menos spam)
- ✅ API simple y moderna

### Pasos para Configurar Resend:

1. **Crear cuenta en Resend:**
   - Ve a https://resend.com
   - Crea una cuenta gratuita

2. **Obtener API Key:**
   - En el dashboard de Resend, ve a "API Keys"
   - Crea una nueva API Key
   - Cópiala (solo se muestra una vez)

3. **Verificar dominio (opcional pero recomendado):**
   - Para usar tu propio dominio (ej: `noreply@tudominio.com`)
   - Ve a "Domains" en Resend
   - Agrega tu dominio y sigue las instrucciones para verificar

4. **Configurar variables de entorno:**
   - Abre tu archivo `.env.local`
   - Agrega:
     ```env
     RESEND_API_KEY=re_xxxxxxxxxxxxx
     RESEND_FROM_EMAIL=Brand Keeper <noreply@tudominio.com>
     ```
   - O si no tienes dominio verificado, usa el dominio de prueba de Resend:
     ```env
     RESEND_FROM_EMAIL=Brand Keeper <onboarding@resend.dev>
     ```

5. **Instalar el paquete:**
   ```powershell
   pnpm add resend
   ```

6. **¡Listo!** Los correos se enviarán automáticamente cuando crees usuarios

## Cómo Funciona el Código

El código está diseñado para funcionar **con o sin** Resend:

1. **Si Resend está configurado:**
   - Envía correos reales automáticamente
   - Funciona en desarrollo y producción

2. **Si Resend NO está configurado:**
   - En desarrollo: Muestra la contraseña en la consola
   - En producción: Registra un warning en los logs

## Alternativas a Resend

Si prefieres otro servicio, puedes usar:

- **SendGrid** (gratis hasta 100 correos/día)
- **Mailgun** (gratis hasta 5,000 correos/mes)
- **AWS SES** (muy económico, más complejo)
- **Nodemailer con SMTP** (gratis pero más trabajo de configuración)

## Verificar que Funciona

1. Crea un usuario nuevo en la aplicación
2. Revisa tu bandeja de entrada (y spam)
3. Deberías recibir el correo con la contraseña

Si no recibes el correo:
- Revisa la carpeta de spam
- Verifica que `RESEND_API_KEY` esté correctamente configurado
- Revisa los logs del servidor para ver errores

