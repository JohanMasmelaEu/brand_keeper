# Brand Keeper

**Plataforma Corporativa de Gestión de Marca**

## Descripción

Brand Keeper es una plataforma corporativa diseñada para centralizar, gestionar y distribuir todos los elementos de marca de una empresa matriz y sus empresas hijas. El objetivo es asegurar consistencia visual, facilitar el acceso a recursos oficiales y permitir que cada compañía gestione solo lo correspondiente a su propia identidad, bajo un modelo controlado de permisos.

## Stack Tecnológico

- **Gestor de Paquetes**: PNPM
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Shadcn UI
- **Componentes UI**: Shadcn UI (componentes accesibles basados en Radix UI)
- **Backend**: Next.js API Routes + Supabase
- **Base de Datos**: Supabase/PostgreSQL
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Despliegue**: Vercel

## Entorno de Desarrollo

- **Sistema Operativo**: Windows
- **Shell**: PowerShell (PWS)
- **Nota**: Todos los comandos en la documentación y scripts están diseñados para PowerShell en Windows. Si estás desarrollando en otro SO, consulta la documentación específica.

## Objetivos del MVP

- 🏢 **Centralización**: Todos los recursos visuales y lineamientos de marca en un único sistema
- 👥 **Gestión Multi-empresa**: Interfaces para empresa matriz y empresas hijas
- 🔐 **Control de Acceso**: Permisos claros por rol (Super Admin, Admin, Colaborador)
- ✉️ **Generador de Firma**: Firma de correo alineada con identidad visual
- 📦 **Librería de Activos**: Gestión y distribución de recursos de marca
- 📖 **Manual de Marca**: Generación automática de guías de marca

## Funcionalidades Principales

### Gestión de Marcas
- Configuración de marca (logo, colores, tipografías)
- Librería de activos (imágenes, documentos)
- Manual de marca básico generado automáticamente

### Generador de Firma de Correo
- Plantillas centrales administradas
- Formulario con validación
- Vista previa en tiempo real
- Exportación HTML

### Administración de Usuarios
- Gestión de usuarios por empresa
- Asignación de roles y permisos
- Control estricto de accesos cruzados

## Estructura de Empresas

- **Empresa Matriz**: Control total de configuración
- **Empresas Hijas**: Configuración de marca restringida e independiente
- **Jerarquía Simple**: Cada usuario pertenece a una empresa

## Roles del Sistema

1. **Super Admin** (Empresa Matriz)
   - Gestión de todas las empresas
   - Acceso total a módulos y recursos
   - Creación y gestión de empresas hijas

2. **Admin** (Empresa Hija/Matriz)
   - Gestión de contenidos de su empresa
   - Creación de colaboradores
   - Sin acceso a otras empresas

3. **Colaborador**
   - Acceso de solo lectura y uso
   - Visualización de recursos autorizados
   - Generación de firma de correo

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+ instalado
- PNPM instalado (recomendado) o npm
- Cuenta de Supabase configurada

### Pasos de Instalación

1. **Instalar dependencias**:
   ```powershell
   pnpm install
   ```

2. **Configurar variables de entorno**:
   - Copia el archivo `env.example` a `.env.local`:
     ```powershell
     Copy-Item env.example .env.local
     ```
   - Edita `.env.local` y completa con tus credenciales de Supabase:
     - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima pública
     - `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio (solo server-side)
     - `NEXT_PUBLIC_APP_URL`: URL de la aplicación (http://localhost:3000 para desarrollo)
   
   **Nota**: Si tienes la integración de Supabase + Vercel configurada, las variables se sincronizan automáticamente en producción. Para desarrollo local, siempre necesitas configurar `.env.local`. Consulta [context/SUPABASE_SETUP.md](./context/SUPABASE_SETUP.md) para la configuración completa.

3. **Ejecutar en desarrollo**:
   ```powershell
   pnpm dev
   ```

4. **Abrir en el navegador**:
   - Navega a `http://localhost:3000`

### Comandos Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta el linter de código

### Uso de Shadcn UI

Este proyecto utiliza **Shadcn UI** para todos los componentes visuales. Los componentes son accesibles, personalizables y basados en Radix UI.

**Instalar un componente**:
```powershell
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
```

**Componentes disponibles**: Consulta todos los componentes disponibles en [ui.shadcn.com](https://ui.shadcn.com)

**Personalización**: Los componentes se instalan en `components/ui/` y pueden ser modificados directamente según las necesidades del proyecto.

**Utilidad de clases**: Usa la función `cn()` de `lib/utils.ts` para combinar clases de Tailwind de manera segura:
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-classes", condition && "conditional-classes")} />
```

## Despliegue en Vercel

Este proyecto está configurado para desplegarse en Vercel. La configuración incluye:

- **Configuración automática**: Vercel detecta Next.js y configura el build automáticamente
- **Integración con Supabase**: Si tienes la extensión de Vercel instalada en Supabase, las variables de entorno se sincronizan automáticamente
- **Optimizaciones**: Configuración optimizada para producción con headers de seguridad

### Guía de Despliegue

Consulta la guía completa en [context/VERCEL_DEPLOYMENT.md](./context/VERCEL_DEPLOYMENT.md) que incluye:
- Pasos detallados para desplegar desde el dashboard de Vercel
- Configuración de variables de entorno
- Integración con Supabase
- Troubleshooting común
- Configuración de dominio personalizado

### Despliegue Rápido

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Si tienes la extensión de Vercel en Supabase, las variables se sincronizan automáticamente
3. Si no, configura manualmente las variables de entorno (ver guía completa)
4. Haz clic en "Deploy"

## Documentación

Para más detalles sobre el contexto, alcance y arquitectura del proyecto, consulta:
- [CONTEXT.md](./CONTEXT.md) - Contexto completo y alcance detallado del MVP
- [.cursorrules](./.cursorrules) - Reglas, convenciones y stack técnico del proyecto
- [context/](./context/) - Documentación específica sobre temas particulares de la aplicación
  - [VERCEL_DEPLOYMENT.md](./context/VERCEL_DEPLOYMENT.md) - Guía completa de despliegue en Vercel
  - [SUPABASE_SETUP.md](./context/SUPABASE_SETUP.md) - Configuración de Supabase
  - [SECURITY.md](./context/SECURITY.md) - Consideraciones de seguridad

## Estado del Proyecto

🚧 **En Desarrollo** - MVP 1.0

### Módulos Completados ✅

- ✅ **Infraestructura Base**: Conexión con Supabase, despliegue en Vercel, autenticación
- ✅ **Gestión de Perfil de Usuario**: Edición de perfil, subida de avatar, recorte de imagen
- ✅ **Gestión de Empresas**: CRUD completo de empresas, redes sociales, organigrama
- ✅ **Gestión de Usuarios**: CRUD completo de usuarios, filtros avanzados, paginación, reenvío de correo

### Próximos Módulos 🚧

- 🚧 **Gestión de Marcas**: Configuración de marca, librería de activos, manual de marca
- 🚧 **Generador de Firma de Correo**: Plantillas, formulario, vista previa, exportación

## Licencia

Apache License 2.0 - Ver [LICENSE](./LICENSE) para más detalles.
