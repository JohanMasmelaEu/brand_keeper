# Brand Keeper - Contexto y Alcance del MVP

## Descripción General

**Brand Keeper** es una plataforma corporativa diseñada para centralizar, gestionar y distribuir todos los elementos de marca de una empresa matriz y sus empresas hijas. El objetivo es asegurar consistencia visual, facilitar el acceso a recursos oficiales y permitir que cada compañía gestione solo lo correspondiente a su propia identidad, bajo un modelo controlado de permisos.

Esta definición corresponde al alcance completo del **MVP (Minimum Viable Product)** que se construirá en **Next.js**, desplegado en **Vercel** y con base de datos y autenticación administrada desde **Supabase**.

## Objetivos del MVP

1. **Centralizar** todos los recursos visuales y lineamientos de marca en un único sistema
2. **Proveer** interfaces simples para la administración de contenido por parte de la empresa matriz y de cada empresa hija
3. **Permitir** que los colaboradores accedan y utilicen únicamente los recursos autorizados
4. **Incluir** un Generador de Firma de Correo alineado con la identidad visual
5. **Garantizar** permisos de acceso claros para diferenciar responsabilidades
6. **Tener** un sistema operativo mínimo viable que pueda escalar con módulos adicionales en futuras versiones

## Alcance del MVP

### 1. Empresas y Jerarquía

#### 1.1 Empresa Matriz
- Control total de configuración
- Puede gestionar todas las empresas hijas
- Acceso a todos los recursos y configuraciones

#### 1.2 Empresas Hijas
- Cada una con su propia configuración de marca restringida
- Dependientes de la empresa matriz
- Gestión independiente de sus propios recursos

#### 1.3 Relación Jerárquica
- Relación simple: cada usuario pertenece a la empresa matriz o a una empresa hija
- No hay niveles intermedios en el MVP

### 2. Gestión Básica de Permisos

El MVP contempla tres roles principales:

#### 2.1 Super Admin
- **Pertenencia**: Empresa matriz únicamente
- **Capacidades**:
  - Gestionar contenidos y configuraciones de todas las empresas
  - Acceso total a todos los módulos y recursos
  - Crear, editar y eliminar empresas hijas
  - Asignar roles a cualquier usuario
  - Configurar plantillas globales y recursos compartidos

#### 2.2 Admin
- **Pertenencia**: Empresa hija o empresa matriz
- **Capacidades**:
  - Solo gestionar contenidos y configuraciones de la empresa a la que pertenece
  - No puede ver ni editar contenidos de otras empresas
  - Crear y gestionar colaboradores dentro de su propia empresa
  - No puede gestionar empresas hijas ni tocar configuraciones globales
  - Puede crear plantillas propias si está permitido por la matriz

#### 2.3 Colaborador
- **Pertenencia**: Cualquier empresa (matriz o hija)
- **Capacidades**:
  - Acceso de solo uso (lectura)
  - Ver y utilizar contenidos autorizados de su empresa
  - Ver y usar contenidos de la empresa matriz (liberados globalmente)
  - No puede editar ni cargar contenido
  - Generar su firma de correo con base en las plantillas establecidas para su empresa

### 3. Módulos Incluidos en el MVP

#### 3.1 Gestión de Marcas

##### 3.1.1 Configuración de la Marca
- **Logo oficial**: Carga y gestión del logo principal
- **Paleta de colores**: Definición de colores corporativos (códigos hex, RGB, etc.)
- **Tipografías autorizadas**: Configuración de fuentes permitidas
- **Variantes de marca por empresa hija**: Cada empresa hija puede tener variaciones aprobadas
- **Recursos complementarios**: Iconos, patrones, banners, etc.

##### 3.1.2 Librería de Activos
- **Formatos soportados**:
  - Imágenes: PNG, JPG, SVG
  - Documentos: PDF, ZIP, DOCX
- **Organización**: Por carpetas o categorías
- **Funcionalidades**:
  - Carga de archivos
  - Descarga para colaboradores
  - Control de visibilidad:
    - **Global**: Visible para todas las empresas (empresa matriz)
    - **Empresa específica**: Solo visible para la empresa propietaria

##### 3.1.3 Manual de Marca Básico
- Página que resume colores, tipografías y usos básicos
- Generado automáticamente según los datos configurados
- Accesible para todos los usuarios según permisos

#### 3.2 Generador de Firma de Correo

##### 3.2.1 Plantillas Centrales
- Administradas por la empresa matriz
- Tipos de plantillas:
  - **Plantilla simple**: Diseño básico sin fotografía
  - **Plantilla con fotografía**: Incluye espacio para foto del colaborador
  - **Plantilla vertical**: Diseño en formato vertical
- Variantes por empresa hija (opcional, si están configuradas)

##### 3.2.2 Formulario para el Colaborador
- Campos requeridos:
  - Nombre completo
  - Cargo
  - Teléfono, extensión
  - Correo corporativo
- **Autocompletado**: Sitio web según empresa
- **Validación**: Por política corporativa (formato de correo, teléfono, etc.)

##### 3.2.3 Vista Previa en Tiempo Real
- Renderización HTML con estilos inline
- Identidad visual aplicada según empresa del usuario
- Actualización instantánea al modificar campos

##### 3.2.4 Exportación
- **Copiar HTML al portapapeles**: Para pegar directamente en cliente de correo
- **Descargar archivo .html**: Para uso offline o importación

#### 3.3 Administración de Usuarios

- **Creación de usuarios**: Asignación a empresa y rol
- **Autenticación**: Vía Supabase Auth
- **Perfil básico**: Editable por el usuario (nombre, foto opcional)
- **Gestión administrativa**:
  - Listado de usuarios
  - Edición de usuarios
  - Desactivación de usuarios
- **Control estricto**: Evitar accesos cruzados entre empresas

## Arquitectura Técnica del MVP

### 4.1 Gestor de Paquetes y Herramientas

- **Gestor de Paquetes**: PNPM
- **Comandos estándar**: Usar `pnpm` en lugar de `npm` o `yarn` para todas las operaciones de paquetes
- **Entorno de Desarrollo**: 
  - **Sistema Operativo**: Windows
  - **Shell**: PowerShell (PWS)
  - **Nota**: Todos los comandos y scripts deben usar sintaxis de PowerShell. Si se desarrolla en otro SO, adaptar los comandos según corresponda.
- **Lenguaje de Programación**: TypeScript (obligatorio)
- **Linting y Calidad de Código**: ESLint con configuración de Next.js

### 4.2 Frontend

- **Framework**: Next.js 15 (o versión estable actual)
- **Lenguaje**: TypeScript (obligatorio para todo el código)
- **Routing**: App Router
- **Componentes**: Server Components cuando aplique
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn UI (componentes accesibles basados en Radix UI)
  - Instalación de componentes: `pnpm dlx shadcn@latest add [component-name]`
  - Componentes ubicados en `components/ui/`
  - Personalizables y basados en variables CSS
  - Soporte para temas claro/oscuro
- **Type Safety**: 
  - TypeScript con configuración estricta
  - Tipos explícitos para todas las APIs públicas
  - Interfaces y tipos definidos para estructuras de datos
  - Tipos generados de Supabase para la base de datos
- **Rendering**:
  - SSR (Server-Side Rendering) para contenido dinámico
  - SSG (Static Site Generation) cuando aplique
- **Interfaz**: Modular por rol (diferentes vistas según permisos)
- **Validación de Código**: 
  - ESLint configurado con `eslint-config-next`
  - Ejecutar `pnpm lint` antes de commits
  - Resolver todos los warnings y errors de ESLint

### 4.3 Backend

- **API**: Endpoints API Route Handlers de Next.js
- **Autenticación**: Supabase Auth
- **Autorización**: Middleware de validación por rol y empresa
- **Persistencia**: Supabase como backend administrado

### 4.4 Base de Datos (Supabase / Postgres)

#### Entidades Mínimas:

- **`users`**
  - Información de usuario
  - Relación con empresa y rol
  - Perfil básico

- **`companies`**
  - Empresa matriz e hijas
  - Configuración básica
  - Relación jerárquica

- **`brand_settings`**
  - Configuraciones de marca por empresa
  - Colores, tipografías, logos
  - Variantes y personalizaciones

- **`brand_assets`**
  - Archivos y recursos de marca
  - Metadatos (nombre, categoría, visibilidad)
  - Referencia a storage

- **`email_signature_templates`**
  - Plantillas de firma de correo
  - HTML y estilos
  - Asociación a empresa

- **`permissions` / `roles`**
  - Definición de roles
  - Permisos asociados
  - Control de acceso

- **`audit_logs`**
  - Auditoría mínima para el MVP
  - Registro de acciones importantes
  - Trazabilidad básica

### 4.5 Storage

- **Plataforma**: Supabase Storage
- **Uso**: Logos, recursos y plantillas
- **Seguridad**: Control de políticas RLS (Row Level Security) para acceso seguro
- **Organización**: Por empresa y tipo de recurso

### 4.6 Despliegue

- **Frontend y Backend**: Desplegados en Vercel
- **Base de Datos y Auth**: Supabase como backend administrado
- **Configuración**: Variables de entorno gestionadas en Vercel
- **Optimización**: Build optimizado para clientes corporativos

## Flujo General del Usuario en el MVP

### 5.1 Super Admin

1. Configura marca matriz (colores, logos, tipografías)
2. Crea empresas hijas
3. Crea admins y colaboradores
4. Carga plantillas globales de firma de correo
5. Gestiona recursos de cualquier empresa
6. Asigna permisos y roles

### 5.2 Admin

1. Configura marca de su empresa (si tiene permisos)
2. Carga y organiza recursos de su empresa
3. Gestiona colaboradores de su empresa
4. Crea plantillas propias si está permitido por la matriz
5. Visualiza manual de marca de su empresa

### 5.3 Colaborador

1. Visualiza activos y lineamientos de su empresa
2. Accede a recursos globales de la empresa matriz
3. Utiliza recursos aprobados (descarga)
4. Genera su firma de correo personalizada
5. Consulta manual de marca

## Fuera de Alcance en el MVP

Los siguientes elementos **NO** están incluidos en el MVP:

- ❌ Versionado de recursos
- ❌ Editor avanzado de plantillas de firma (drag and drop)
- ❌ Sistema de notificaciones
- ❌ Integración con Active Directory o Google Workspace
- ❌ Módulos de comunicación interna
- ❌ Autogeneración de plantillas para redes sociales
- ❌ Soporte multilenguaje
- ❌ Temas personalizados de interfaz
- ❌ Automatización de actualización de firmas por API

## Futuras Mejoras y Módulos Sugeridos

### Fase 2 - Mejoras Inmediatas
- Editor avanzado de plantillas visuales (drag and drop)
- Integraciones con IDEs de correo (Outlook Add-in, Gmail API)
- Dashboard de analítica de uso
- Permisos avanzados por carpeta o categoría

### Fase 3 - Funcionalidades Avanzadas
- Workflows de aprobación de contenido
- Versionamiento de recursos y restore
- Módulo de plantillas para redes sociales
- Módulo de plantillas para documentos corporativos

### Fase 4 - Expansión
- Módulo de capacitaciones y material educativo
- Módulo de anuncios y comunicación corporativa
- Sistema de notificaciones push y por correo
- Modo multilenguaje
- Integración con IA para generación de variaciones de marca aprobadas

## Consideraciones de Implementación

### Seguridad
- Validación de permisos en múltiples capas (UI, API, DB)
- Row Level Security (RLS) en Supabase
- Control estricto de accesos cruzados entre empresas
- Políticas de storage basadas en empresa y rol

### Performance
- Optimización de queries a Supabase
- Uso apropiado de Server Components
- Caching estratégico donde aplique
- Lazy loading de recursos pesados

### Escalabilidad
- Arquitectura modular para facilitar adición de módulos
- Separación clara de responsabilidades
- Código preparado para futuras expansiones
- Base de datos diseñada para crecimiento

### Calidad de Código
- **TypeScript estricto**: Configuración estricta habilitada para prevenir errores de tipo
  - Evitar el uso de `any`, preferir `unknown` con type guards cuando sea necesario
  - Tipos explícitos para todas las APIs públicas
  - Interfaces y tipos definidos para todas las estructuras de datos
  - Tipos generados de Supabase para mantener sincronización con la base de datos
- **ESLint**: Validación obligatoria de estándares de código
  - Ejecutar `pnpm lint` antes de cada commit
  - Resolver todos los warnings y errors de ESLint
  - Configuración basada en `eslint-config-next` con reglas adicionales según necesidades
  - No dejar código comentado sin justificación
  - No usar `console.log` en producción (implementar sistema de logging apropiado)
- **Buenas Prácticas**:
  - Funciones pequeñas con responsabilidad única
  - Nombres descriptivos para variables y funciones
  - Comentar código complejo o lógica de negocio no obvia
  - Mantener separación clara entre lógica de negocio y presentación

### UX/UI
- **OBLIGATORIO**: Todo lo referente a UX o UI debe utilizar los componentes de Shadcn UI ya instalados
- **NO crear componentes UI personalizados** desde cero - siempre usar o adaptar componentes de Shadcn
- Interfaz intuitiva por rol
- Feedback claro sobre permisos y restricciones
- Vista previa en tiempo real en generador de firma
- Navegación clara entre módulos
- **Principio**: Si necesitas un componente UI, primero busca en `components/ui/` - si no existe, instálalo desde Shadcn antes de crear uno personalizado

---

**Versión**: MVP 1.0  
**Última actualización**: Definición inicial del alcance  
**Estado**: En desarrollo

## Documentación Adicional

Para información detallada sobre temas específicos de la aplicación, consulta los archivos en la carpeta [`context/`](./context/), que contiene documentación técnica sobre módulos, flujos de negocio, arquitectura de componentes y especificaciones detalladas.