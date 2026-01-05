# Módulo de Configuración de Marca - Brand Keeper

Este documento describe el módulo de **Configuración de Marca** que debe implementarse para completar las funcionalidades del sistema, especialmente la integración con el Generador de Firma de Correo.

## Estado Actual

⏳ **PENDIENTE DE IMPLEMENTACIÓN**

Este módulo es **requerido** para que las firmas de correo puedan usar los elementos de marca configurados (colores, tipografías, logos) en lugar de valores hardcodeados.

## Objetivo

Permitir a las empresas (matriz e hijas) configurar su identidad visual de marca, incluyendo:
- Colores corporativos (primario, secundario)
- Tipografías autorizadas
- Logos y variantes
- Elementos visuales complementarios

## Alcance del Módulo

### 1. Configuración de Colores

#### 1.1 Color Primario
- **Requerido**: Sí
- **Formato**: Hexadecimal (#RRGGBB)
- **Uso**: Color principal de la marca
- **Validación**: Formato hexadecimal válido

#### 1.2 Color Secundario
- **Requerido**: No (opcional)
- **Formato**: Hexadecimal (#RRGGBB)
- **Uso**: Color complementario de la marca
- **Validación**: Formato hexadecimal válido

#### 1.3 Colores Adicionales (Futuro)
- **Requerido**: No
- **Formato**: Array de colores hexadecimales
- **Uso**: Paleta extendida de colores
- **Nota**: No incluido en MVP inicial

### 2. Configuración de Tipografías

#### 2.1 Fuente Principal
- **Requerido**: Sí
- **Tipo**: Nombre de fuente (string)
- **Opciones**:
  - Fuentes del sistema (Arial, Helvetica, Times New Roman, etc.)
  - Google Fonts (integración con selector existente)
- **Uso**: Tipografía principal para documentos y firmas

#### 2.2 Fuentes Secundarias (Futuro)
- **Requerido**: No
- **Tipo**: Array de fuentes
- **Uso**: Tipografías complementarias
- **Nota**: No incluido en MVP inicial

### 3. Gestión de Logos

#### 3.1 Logo Principal
- **Requerido**: Sí
- **Formato**: URL (almacenado en Supabase Storage)
- **Tipos soportados**: PNG, JPG, SVG
- **Tamaño máximo**: 5MB
- **Uso**: Logo principal de la empresa

#### 3.2 Variantes de Logo (Futuro)
- **Requerido**: No
- **Tipos**:
  - Logo horizontal
  - Logo vertical
  - Icono/Isotipo
  - Versión monocromática
- **Nota**: No incluido en MVP inicial, pero estructura de base de datos debe permitirlo

### 4. Configuración por Empresa

#### 4.1 Empresa Matriz
- Puede configurar su propia marca
- Puede configurar configuraciones globales (compartidas con empresas hijas)
- Puede ver y gestionar configuraciones de empresas hijas

#### 4.2 Empresas Hijas
- Pueden configurar su propia marca (variaciones aprobadas)
- Pueden usar configuraciones globales de la matriz
- No pueden modificar configuraciones globales

## Estructura de Base de Datos

### Tabla: `brand_settings`

```sql
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) NOT NULL CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color VARCHAR(7) CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_family VARCHAR(100) NOT NULL,
  logo_url TEXT,
  logo_variants JSONB DEFAULT '{}'::jsonb,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, is_global)
);

-- Índices
CREATE INDEX idx_brand_settings_company_id ON brand_settings(company_id);
CREATE INDEX idx_brand_settings_is_global ON brand_settings(is_global);

-- Políticas RLS
-- (Ver sección de Seguridad)
```

### Relaciones

- **`brand_settings.company_id`** → `companies.id`
  - Una empresa puede tener múltiples configuraciones (una propia y una global si es matriz)
  - Restricción: `UNIQUE(company_id, is_global)` para evitar duplicados

## API Routes Requeridas

### GET /api/brand-settings

Obtener todas las configuraciones de marca según permisos.

**Permisos**:
- Super Admin: Ve todas las configuraciones
- Admin: Ve solo la configuración de su empresa

**Query Parameters**:
- `company_id` (opcional): Filtrar por empresa
- `is_global` (opcional): Filtrar por configuraciones globales

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "primary_color": "#FF5733",
      "secondary_color": "#33FF57",
      "font_family": "Roboto",
      "logo_url": "https://...",
      "logo_variants": {},
      "is_global": false,
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ]
}
```

### GET /api/brand-settings/[company_id]

Obtener configuración de marca de una empresa específica.

**Permisos**:
- Super Admin: Puede ver cualquier empresa
- Admin: Solo puede ver su propia empresa

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "primary_color": "#FF5733",
    "secondary_color": "#33FF57",
    "font_family": "Roboto",
    "logo_url": "https://...",
    "logo_variants": {},
    "is_global": false,
    "created_at": "2024-12-01T00:00:00Z",
    "updated_at": "2024-12-01T00:00:00Z"
  }
}
```

### POST /api/brand-settings

Crear nueva configuración de marca.

**Permisos**:
- Super Admin: Puede crear para cualquier empresa
- Admin: Solo puede crear para su propia empresa (no globales)

**Body**:
```json
{
  "company_id": "uuid",
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "font_family": "Roboto",
  "logo_url": "https://...",
  "is_global": false
}
```

**Validaciones**:
- `primary_color`: Formato hexadecimal válido
- `secondary_color`: Formato hexadecimal válido (opcional)
- `font_family`: No vacío
- `company_id`: UUID válido
- `is_global`: Solo empresa matriz puede crear configuraciones globales

### PUT /api/brand-settings/[id]

Actualizar configuración de marca existente.

**Permisos**:
- Super Admin: Puede actualizar cualquier configuración
- Admin: Solo puede actualizar configuración de su empresa (no globales)

**Body**:
```json
{
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "font_family": "Roboto",
  "logo_url": "https://..."
}
```

### POST /api/brand-settings/[id]/logo

Subir logo para una configuración de marca.

**Permisos**:
- Super Admin: Puede subir para cualquier configuración
- Admin: Solo puede subir para configuración de su empresa

**Body**: FormData con archivo de imagen

**Validaciones**:
- Tipo de archivo: PNG, JPG, SVG
- Tamaño máximo: 5MB
- Dimensiones: Recomendado mínimo 200x200px

**Response**:
```json
{
  "logo_url": "https://supabase.co/storage/v1/object/public/brand-logos/company-uuid/logo.png"
}
```

## Componentes Requeridos

### BrandSettingsForm

Formulario para crear/editar configuración de marca.

**Props**:
```typescript
interface BrandSettingsFormProps {
  brandSettings?: BrandSettings
  mode: "create" | "edit"
  companyId: string
  userRole: "super_admin" | "admin"
  onFormReady?: (form, isSubmitting, onSubmit) => void
  onFormChange?: (values) => void
}
```

**Campos**:
- Color primario (ColorPicker)
- Color secundario (ColorPicker, opcional)
- Fuente (FontSelector con Google Fonts)
- Logo (LogoUploader)

### ColorPicker

Selector de color con input hexadecimal y selector visual.

**Props**:
```typescript
interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
  required?: boolean
}
```

**Características**:
- Input de texto para código hexadecimal
- Selector visual de color (usar componente de Shadcn si existe)
- Validación de formato hexadecimal
- Vista previa del color

### FontSelector

Selector de fuente con integración de Google Fonts.

**Nota**: Puede reutilizar `GoogleFontSelector` existente o extenderlo.

**Props**:
```typescript
interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  includeSystemFonts?: boolean
}
```

**Opciones**:
- Fuentes del sistema (Arial, Helvetica, Times New Roman, etc.)
- Google Fonts (usar selector existente)

### LogoUploader

Componente para subir y gestionar logos.

**Props**:
```typescript
interface LogoUploaderProps {
  value?: string
  onChange: (url: string) => void
  companyId: string
  onUploadStart?: () => void
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
}
```

**Características**:
- Drag & drop o click para seleccionar
- Vista previa de imagen
- Validación de tipo y tamaño
- Subida a Supabase Storage
- Eliminación de logo anterior al subir uno nuevo

### BrandSettingsView

Vista principal de configuración de marca.

**Características**:
- Muestra configuración actual de la empresa
- Botón para crear/editar configuración
- Vista previa de marca configurada
- Acceso según permisos

### BrandPreview

Vista previa de marca configurada.

**Características**:
- Muestra colores configurados
- Muestra tipografía configurada
- Muestra logo configurado
- Vista previa de cómo se vería en una firma

## Funciones de Base de Datos

### lib/supabase/brand.ts

```typescript
// Obtener todas las configuraciones según permisos
export async function getAllBrandSettings(): Promise<BrandSettings[]>

// Obtener configuración por empresa
export async function getBrandSettingsByCompanyId(companyId: string): Promise<BrandSettings | null>

// Obtener configuración por ID
export async function getBrandSettingsById(id: string): Promise<BrandSettings | null>

// Crear configuración
export async function createBrandSettings(input: CreateBrandSettingsInput): Promise<BrandSettings>

// Actualizar configuración
export async function updateBrandSettings(id: string, input: UpdateBrandSettingsInput): Promise<BrandSettings>

// Eliminar configuración
export async function deleteBrandSettings(id: string): Promise<void>
```

## Validaciones y Esquemas

### lib/validations/schemas.ts

```typescript
export const createBrandSettingsSchema = z.object({
  company_id: z.string().uuid("El ID de la empresa no es válido"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color primario debe ser un código hexadecimal válido"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color secundario debe ser un código hexadecimal válido").optional().nullable(),
  font_family: z.string().min(1, "La fuente es requerida"),
  logo_url: z.string().url("La URL del logo no es válida").optional().nullable(),
  is_global: z.boolean().optional().default(false),
})

export const updateBrandSettingsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color primario debe ser un código hexadecimal válido").optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color secundario debe ser un código hexadecimal válido").optional().nullable(),
  font_family: z.string().min(1, "La fuente es requerida").optional(),
  logo_url: z.string().url("La URL del logo no es válida").optional().nullable(),
})
```

## Integración con Módulo de Firmas

Una vez implementado este módulo, se debe actualizar:

### 1. EmailSignatureGenerator

```typescript
// Cargar configuración de marca
const brandSettings = await getBrandSettingsByCompanyId(companyId)

// Aplicar colores de marca
if (brandSettings?.primary_color) {
  html = html.replace(/{primary_color}/g, brandSettings.primary_color)
}
if (brandSettings?.secondary_color) {
  html = html.replace(/{secondary_color}/g, brandSettings.secondary_color)
}

// Aplicar tipografía de marca
if (brandSettings?.font_family) {
  html = applyBrandFontToHtml(html, brandSettings.font_family)
}

// Aplicar logo de marca
if (brandSettings?.logo_url) {
  html = html.replace(/{company_logo}/g, brandSettings.logo_url)
}
```

### 2. Funciones de Aplicación de Estilos

```typescript
// Priorizar tipografía de marca sobre Google Fonts
export function applyBrandFontToHtml(html: string, fontFamily: string): string {
  // Si ya hay Google Fonts, mantenerlos pero agregar font-family de marca
  // Si no hay Google Fonts, usar font-family de marca directamente
}

// Aplicar colores de marca
export function applyBrandColorsToHtml(html: string, primaryColor: string, secondaryColor?: string): string {
  // Reemplazar variables de color en el HTML
  // Aplicar estilos inline si es necesario
}
```

## Seguridad

### Políticas RLS

```sql
-- Super Admin puede ver todas las configuraciones
CREATE POLICY "Super Admin can view all brand settings"
ON brand_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
    AND user_profiles.is_active = true
  )
);

-- Admin puede ver solo su empresa
CREATE POLICY "Admin can view own company brand settings"
ON brand_settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
    AND user_profiles.company_id = brand_settings.company_id
    AND user_profiles.is_active = true
  )
);

-- Super Admin puede crear para cualquier empresa
CREATE POLICY "Super Admin can create brand settings"
ON brand_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
    AND user_profiles.is_active = true
  )
);

-- Admin solo puede crear para su empresa (no globales)
CREATE POLICY "Admin can create own company brand settings"
ON brand_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
    AND user_profiles.company_id = brand_settings.company_id
    AND brand_settings.is_global = false
    AND user_profiles.is_active = true
  )
);

-- Políticas similares para UPDATE y DELETE
```

### Políticas de Storage para Logos

```sql
-- Bucket: brand-logos
-- Estructura: brand-logos/{company_id}/logo.{ext}

-- Usuarios pueden subir logos para su empresa
CREATE POLICY "Users can upload logos for their company"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-logos'
  AND (storage.foldername(name))[1] = (
    SELECT company_id::text FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Usuarios pueden leer logos de su empresa y empresas globales
CREATE POLICY "Users can read logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'brand-logos'
  AND (
    (storage.foldername(name))[1] = (
      SELECT company_id::text FROM user_profiles
      WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id::text = (storage.foldername(name))[1]
      AND companies.is_parent = true
    )
  )
);
```

## Páginas Requeridas

### /dashboard/brand-settings

Página principal de configuración de marca.

**Características**:
- Muestra configuración actual de la empresa del usuario
- Botón para crear/editar configuración
- Vista previa de marca
- Acceso según permisos

### /dashboard/brand-settings/new

Página para crear nueva configuración de marca.

### /dashboard/brand-settings/[id]/edit

Página para editar configuración de marca existente.

## Próximos Pasos

1. **Crear migración SQL** para tabla `brand_settings`
2. **Implementar funciones de base de datos** en `lib/supabase/brand.ts`
3. **Crear API routes** en `app/api/brand-settings/`
4. **Crear componentes** (BrandSettingsForm, ColorPicker, LogoUploader, etc.)
5. **Crear páginas** de configuración de marca
6. **Integrar con módulo de firmas** para usar elementos de marca
7. **Actualizar tipos TypeScript** para incluir BrandSettings
8. **Actualizar validaciones** con esquemas de Zod

## Notas de Implementación

- Reutilizar `GoogleFontSelector` existente para selección de fuentes
- Usar componentes de Shadcn UI para selectores de color si están disponibles
- Implementar subida de logos similar a la subida de avatares
- Validar permisos en múltiples capas (UI, API, DB)
- Aplicar políticas RLS estrictas para seguridad

---

**Estado**: ⏳ Pendiente de implementación  
**Prioridad**: Alta  
**Dependencias**: Ninguna (puede implementarse independientemente)  
**Bloquea**: Integración completa de firmas de correo con elementos de marca

