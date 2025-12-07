# Guía de Despliegue en Vercel

Esta guía explica cómo desplegar Brand Keeper en Vercel, incluyendo la configuración de variables de entorno y la integración con Supabase.

## Prerrequisitos

1. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com) si no la tienes
2. **Proyecto en Supabase**: Asegúrate de que tu proyecto Supabase esté configurado y funcionando
3. **Repositorio Git**: El código debe estar en un repositorio Git (GitHub, GitLab, o Bitbucket)
4. **Extensión de Vercel en Supabase**: Ya instalada (según tu configuración)

## Opción 1: Despliegue desde el Dashboard de Vercel (Recomendado)

### Paso 1: Conectar el Repositorio

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Importa tu repositorio de Git
4. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 2: Configuración del Proyecto

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next` (automático)
- **Install Command**: `pnpm install`

Si no se detecta correctamente, configura manualmente:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (o la ruta donde está tu `package.json`)
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

### Paso 3: Variables de Entorno

#### Opción A: Sincronización Automática con Supabase (Recomendado)

Si tienes la extensión de Vercel instalada en Supabase:

1. En el dashboard de Supabase, ve a **Settings** → **Integrations** → **Vercel**
2. Conecta tu proyecto de Vercel
3. Las siguientes variables se sincronizarán automáticamente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional, solo si lo necesitas)

#### Opción B: Configuración Manual

Si prefieres configurar manualmente o necesitas variables adicionales:

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

**Variables Requeridas:**

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_de_supabase
```

**Variables Opcionales (pero recomendadas):**

```
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

**Nota**: `NEXT_PUBLIC_APP_URL` se puede configurar automáticamente usando la variable de Vercel `VERCEL_URL` en tiempo de ejecución, pero es recomendable establecerla manualmente para producción.

### Paso 4: Configurar URL de Redirección en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **URL Configuration**
3. Agrega las siguientes URLs en **Redirect URLs**:
   - `https://tu-dominio.vercel.app/auth/callback`
   - `https://tu-dominio.vercel.app/**` (para desarrollo)
4. Agrega en **Site URL**:
   - `https://tu-dominio.vercel.app`

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, recibirás una URL de producción (ej: `tu-proyecto.vercel.app`)

## Opción 2: Despliegue desde CLI

### Paso 1: Instalar Vercel CLI

```powershell
pnpm add -g vercel
```

### Paso 2: Iniciar Sesión

```powershell
vercel login
```

### Paso 3: Desplegar

Desde la raíz del proyecto:

```powershell
vercel
```

Sigue las instrucciones:
- ¿Set up and deploy? → **Y**
- ¿Which scope? → Selecciona tu cuenta/organización
- ¿Link to existing project? → **N** (primera vez) o **Y** (si ya existe)
- ¿What's your project's name? → `brand-keeper` (o el nombre que prefieras)
- ¿In which directory is your code located? → `./`

### Paso 4: Configurar Variables de Entorno

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

Para cada variable, ingresa el valor cuando se solicite.

### Paso 5: Desplegar a Producción

```powershell
vercel --prod
```

## Configuración de Dominio Personalizado (Opcional)

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a **Settings** → **Domains**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

**Importante**: Si usas un dominio personalizado, actualiza `NEXT_PUBLIC_APP_URL` y las URLs de redirección en Supabase.

## Variables de Entorno por Entorno

Vercel permite configurar variables de entorno diferentes para:
- **Production**: Producción
- **Preview**: Pull requests y branches
- **Development**: Desarrollo local con `vercel dev`

Configura las variables según el entorno necesario. Para producción, asegúrate de usar:
- URLs de producción de Supabase
- `NEXT_PUBLIC_APP_URL` con tu dominio de producción

## Verificación Post-Despliegue

Después del despliegue, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El login funciona (redirige a Supabase Auth)
3. ✅ El callback de autenticación funciona (`/auth/callback`)
4. ✅ Las cookies de sesión se establecen correctamente
5. ✅ El middleware redirige correctamente según el rol del usuario
6. ✅ Las conexiones a Supabase funcionan (queries, RLS, etc.)

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL no está configurada"

**Solución**: Asegúrate de que las variables de entorno estén configuradas en Vercel y que estén disponibles para el entorno correcto (Production/Preview).

### Error: "Invalid API key" o problemas de autenticación

**Solución**: 
1. Verifica que las claves de Supabase sean correctas
2. Verifica que las URLs de redirección en Supabase incluyan tu dominio de Vercel
3. Asegúrate de que `NEXT_PUBLIC_APP_URL` esté configurada correctamente

### Error: Cookies no funcionan / Sesiones se pierden

**Solución**:
1. Verifica que `NEXT_PUBLIC_APP_URL` esté configurada con `https://`
2. Asegúrate de que las cookies estén configuradas con `secure: true` en producción (ya está implementado en el middleware)
3. Verifica que el dominio en Supabase Auth coincida con tu dominio de Vercel

### Build falla

**Solución**:
1. Verifica que `pnpm` esté disponible (Vercel lo detecta automáticamente)
2. Revisa los logs de build en Vercel para ver errores específicos
3. Asegúrate de que todas las dependencias estén en `package.json`
4. Ejecuta `pnpm lint` localmente para verificar que no haya errores de ESLint

### Variables de entorno no se sincronizan desde Supabase

**Solución**:
1. Verifica que la integración de Vercel esté correctamente conectada en Supabase
2. Revisa los permisos de la integración
3. Si es necesario, configura las variables manualmente en Vercel

## Comandos Útiles

```powershell
# Ver información del proyecto
vercel inspect

# Ver logs en tiempo real
vercel logs

# Desplegar solo a preview
vercel

# Desplegar a producción
vercel --prod

# Ver variables de entorno
vercel env ls

# Eliminar variable de entorno
vercel env rm VARIABLE_NAME

# Desarrollo local con Vercel
vercel dev
```

## Configuración de Build Optimizations

El archivo `vercel.json` ya incluye:
- Configuración de framework Next.js
- Headers de seguridad
- Región de despliegue (iad1 - US East)

Puedes personalizar estas opciones según tus necesidades.

## Monitoreo y Analytics

Vercel proporciona:
- **Analytics**: Métricas de rendimiento y uso
- **Speed Insights**: Análisis de Core Web Vitals
- **Logs**: Logs en tiempo real de la aplicación

Activa estas funciones desde el dashboard de Vercel según tus necesidades.

## Referencias

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Supabase + Vercel Integration](https://supabase.com/docs/guides/integrations/vercel)

