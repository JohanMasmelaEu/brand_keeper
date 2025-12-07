# Políticas de Seguridad - Brand Keeper

Este documento describe las medidas de seguridad implementadas en Brand Keeper.

## Autenticación y Sesiones

### Cookies de Autenticación

Las cookies de autenticación están configuradas con las siguientes medidas de seguridad:

#### Configuración de Cookies

1. **httpOnly**: 
   - **Cookies del servidor**: `true` - Previene acceso desde JavaScript (protección XSS)
   - **Cookies del cliente**: `false` - Necesario para que Supabase SSR funcione correctamente
   - **Nota**: Supabase maneja la seguridad del token internamente, por lo que este trade-off es aceptable

2. **secure**: 
   - **Desarrollo**: `false` (permite HTTP local)
   - **Producción**: `true` (solo HTTPS)
   - Previene transmisión de cookies por conexiones no cifradas

3. **sameSite**: 
   - Valor: `'lax'`
   - Previene ataques CSRF mientras permite navegación normal
   - `'strict'` es más seguro pero puede romper flujos de OAuth

4. **path**: 
   - Valor: `'/'`
   - Restringe la cookie al dominio completo

5. **domain**: 
   - **No establecido por defecto** (más seguro)
   - Solo se establece si es absolutamente necesario

### Tokens de Acceso

- Los tokens de acceso JWT están almacenados en cookies seguras
- Los tokens tienen expiración automática
- Los tokens se refrescan automáticamente mediante el middleware

## Protección contra Ataques Comunes

### XSS (Cross-Site Scripting)

- **Cookies httpOnly**: Las cookies de servidor son httpOnly cuando es posible
- **Content Security Policy**: Considerar implementar CSP headers
- **Sanitización**: Todos los inputs del usuario deben ser validados y sanitizados

### CSRF (Cross-Site Request Forgery)

- **sameSite cookies**: Configurado en `'lax'` para prevenir CSRF
- **Validación de origen**: El middleware valida las solicitudes

### Inyección SQL

- **Supabase RLS**: Row Level Security previene acceso no autorizado
- **Parámetros preparados**: Todas las consultas usan parámetros preparados (Supabase lo maneja)

### Exposición de Información Sensible

- **Logs**: Los logs en desarrollo no exponen valores completos de cookies
- **Variables de entorno**: Las claves secretas nunca se exponen al cliente
- **Service Role Key**: Solo se usa en server-side, nunca en el cliente

## Variables de Entorno

### Seguridad de Variables

- **NEXT_PUBLIC_***: Solo para valores que DEBEN ser públicos (URLs, claves anónimas)
- **Sin NEXT_PUBLIC_**: Valores sensibles que NUNCA deben exponerse al cliente
- **Service Role Key**: Solo para operaciones administrativas en el servidor

### Variables Sensibles

Las siguientes variables **NUNCA** deben tener el prefijo `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio (acceso total)
- `SUPABASE_JWT_SECRET` - Secreto JWT
- Cualquier contraseña o token de API

## Row Level Security (RLS)

### Políticas Implementadas

1. **Companies**: 
   - Todos pueden ver empresas
   - Solo super_admin puede crear/editar/eliminar

2. **User Profiles**: 
   - Usuarios pueden ver su propio perfil
   - Usuarios pueden ver perfiles de su misma empresa
   - Super admin puede ver todos los perfiles
   - Solo admins pueden crear nuevos perfiles

### Validación en Múltiples Capas

- **Base de datos**: RLS previene acceso no autorizado
- **Middleware**: Valida permisos antes de procesar solicitudes
- **API Routes**: Validación adicional en endpoints
- **UI**: Ocultación de elementos según permisos (UX, no seguridad)

## Headers de Seguridad

### Headers Recomendados (Futuro)

Considerar implementar los siguientes headers en producción:

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

## Buenas Prácticas

### Desarrollo

1. **Nunca commitear** `.env.local` o archivos con credenciales
2. **Usar variables de entorno** para toda configuración sensible
3. **Validar inputs** en todas las capas (cliente, servidor, base de datos)
4. **Logs seguros**: No exponer información sensible en logs

### Producción

1. **HTTPS obligatorio**: Todas las conexiones deben usar HTTPS
2. **Cookies secure**: Todas las cookies de autenticación deben tener `secure=true`
3. **Monitoreo**: Implementar logging y monitoreo de seguridad
4. **Actualizaciones**: Mantener dependencias actualizadas

## Auditoría y Monitoreo

### Logs de Seguridad

- Intentos de login fallidos
- Accesos no autorizados
- Cambios en permisos
- Operaciones administrativas

### Consideraciones Futuras

- Implementar rate limiting
- Implementar 2FA (autenticación de dos factores)
- Implementar auditoría completa de acciones
- Implementar alertas de seguridad

## Contacto

Para reportar vulnerabilidades de seguridad, contactar al equipo de desarrollo.

---

**Última actualización**: 2024
**Versión**: 1.0

