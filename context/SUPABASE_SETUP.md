# Configuración de Supabase para Desarrollo y Producción

Este documento explica cómo configurar Supabase para que funcione tanto en desarrollo local como en producción (Vercel).

## Configuración de Variables de Entorno

### Desarrollo Local (`.env.local`)

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Variables necesarias para desarrollo
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante**: El archivo `.env.local` está en `.gitignore` y no se sube al repositorio.

### Producción (Vercel)

Las variables de entorno en producción se configuran de dos formas:

#### Opción 1: Integración Supabase + Vercel (Recomendado)

Si tienes la integración de Supabase con Vercel configurada, las variables se sincronizan automáticamente. Solo necesitas verificar que estén presentes en el dashboard de Vercel.

#### Opción 2: Configuración Manual en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL de tu aplicación en Vercel, ej: `https://tu-app.vercel.app`)

## Configuración de URLs de Redirección en Supabase

Para que la autenticación funcione correctamente, necesitas configurar las URLs de redirección en Supabase:

### Pasos:

1. Ve al Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** > **URL Configuration**
4. En **Redirect URLs**, agrega las siguientes URLs:

#### Para Desarrollo:
```
http://localhost:3000/auth/callback
```

#### Para Producción:
```
https://tu-app.vercel.app/auth/callback
https://tu-dominio.com/auth/callback
```

**Nota**: Puedes agregar múltiples URLs separadas por comas.

### Site URL

Configura la **Site URL** según el entorno:

- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://tu-app.vercel.app` o tu dominio personalizado

## Flujo de Autenticación

### Desarrollo Local

1. El usuario accede a `http://localhost:3000`
2. Si no está autenticado, el middleware redirige a `/login`
3. Después del login exitoso, Supabase redirige a `/auth/callback`
4. El callback intercambia el código por una sesión
5. El usuario es redirigido a la página principal

### Producción

1. El usuario accede a `https://tu-app.vercel.app`
2. Si no está autenticado, el middleware redirige a `/login`
3. Después del login exitoso, Supabase redirige a `/auth/callback`
4. El callback intercambia el código por una sesión
5. El usuario es redirigido a la página principal

## Verificación de Configuración

### Verificar Variables de Entorno en Desarrollo

Ejecuta el siguiente comando para verificar que las variables estén cargadas (sin mostrar los valores):

```powershell
# En PowerShell
Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE"
```

### Verificar en Producción

1. Ve a Vercel Dashboard > Tu Proyecto > Settings > Environment Variables
2. Verifica que todas las variables estén presentes
3. Si usas la integración de Supabase, verifica que esté conectada correctamente

## Solución de Problemas

### Error: "Invalid supabaseUrl"

- Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada correctamente
- Asegúrate de que la URL comience con `https://`
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "Invalid redirect URL"

- Verifica que la URL de callback esté agregada en Supabase > Authentication > URL Configuration
- Asegúrate de que la URL coincida exactamente (incluyendo `http://` o `https://`)

### Variables no se cargan en desarrollo

- Verifica que el archivo se llame exactamente `.env.local` (no `.env.local.txt`)
- Reinicia el servidor de desarrollo (`pnpm dev`)
- Verifica que el archivo esté en la raíz del proyecto

### Variables no se sincronizan en Vercel

- Si usas la integración de Supabase, verifica que esté conectada
- Si configuraste manualmente, verifica que las variables estén en el entorno correcto (Production, Preview, Development)
- Despliega nuevamente después de agregar/modificar variables

## Buenas Prácticas

1. **Nunca subas `.env.local` al repositorio** - Ya está en `.gitignore`
2. **Usa diferentes proyectos de Supabase** para desarrollo y producción (opcional pero recomendado)
3. **Revisa las variables regularmente** para asegurar que estén actualizadas
4. **Documenta cambios** en las variables de entorno en el equipo
5. **Usa la integración Supabase + Vercel** para sincronización automática en producción

## Referencias

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

