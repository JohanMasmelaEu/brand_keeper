# Mockup Temporal - Módulo de Configuración de Marca

Este documento explica cómo funciona el mockup temporal y cómo eliminarlo cuando se valide el módulo.

## Estado Actual

✅ **MOCKUP ACTIVADO** - El módulo está usando datos de prueba en lugar de consultar la base de datos.

## Archivos del Mockup

1. **`lib/supabase/brand.mock.ts`** - Contiene los datos de prueba y funciones mock
2. **`lib/supabase/brand.ts`** - Tiene la variable `USE_MOCK_BRAND_DATA = true` que activa el mockup

## Datos de Prueba Incluidos

El mockup incluye 3 configuraciones de ejemplo:
- **Configuración 1** (company-1): Colores naranja/verde, fuente Roboto
- **Configuración 2** (company-2): Colores azul/rojo, fuente Open Sans
- **Configuración Global** (parent-company): Colores morado/turquesa, fuente Montserrat

## Cómo Validar el Módulo

1. Navegar a `/dashboard/brand-settings` para ver la vista principal
2. Ver los datos de prueba mostrados
3. Probar crear una nueva configuración (se agregará al mockup)
4. Probar editar una configuración existente
5. Verificar que los componentes UI funcionan correctamente

## Cómo Eliminar el Mockup y Activar la DB Real

### Paso 1: Cambiar el flag en `lib/supabase/brand.ts`

```typescript
// Cambiar esta línea:
const USE_MOCK_BRAND_DATA = true

// Por esta:
const USE_MOCK_BRAND_DATA = false
```

### Paso 2: Eliminar las importaciones del mockup

En `lib/supabase/brand.ts`, eliminar estas líneas:

```typescript
// Eliminar estas importaciones:
import {
  getAllBrandSettingsMock,
  getBrandSettingsByIdMock,
  getBrandSettingsByCompanyIdMock,
  createBrandSettingsMock,
  updateBrandSettingsMock,
  deleteBrandSettingsMock,
} from './brand.mock'
```

### Paso 3: Eliminar los condicionales del mockup

En `lib/supabase/brand.ts`, eliminar todos los bloques que empiezan con:

```typescript
// MOCKUP: Retornar datos de prueba
if (USE_MOCK_BRAND_DATA) {
  return ...
}
```

### Paso 4: Eliminar el archivo del mockup

```bash
# Eliminar el archivo
rm lib/supabase/brand.mock.ts
```

### Paso 5: Restaurar el company_id real en las páginas

En `app/dashboard/brand-settings/page.tsx`, cambiar:

```typescript
// Cambiar esta línea:
const mockCompanyId = 'company-1'

// Por esta:
const brandSettings = await getBrandSettingsByCompanyId(profile.company_id, true)
```

Y en el componente:

```typescript
// Cambiar:
companyId={mockCompanyId}

// Por:
companyId={profile.company_id}
```

En `app/dashboard/brand-settings/new/page.tsx`, cambiar:

```typescript
// Cambiar:
companyId="company-1"
userCompanyId="company-1"

// Por:
companyId={profile.company_id}
userCompanyId={profile.company_id}
```

En `app/dashboard/brand-settings/[id]/edit/page.tsx`, cambiar:

```typescript
// Cambiar:
const mockId = 'mock-1'
const brandSettings = await getBrandSettingsById(mockId)

// Por:
const brandSettings = await getBrandSettingsById(id)
```

### Paso 6: Eliminar este archivo

```bash
rm MOCKUP_BRAND_SETTINGS.md
```

## Notas

- El mockup simula delays de red (200-400ms) para hacer la experiencia más realista
- Los datos se mantienen en memoria durante la sesión, pero se pierden al recargar
- Las funciones mock siguen la misma estructura que las funciones reales

---

**Fecha de creación del mockup**: $(date)
**Para eliminar**: Seguir los pasos arriba cuando se valide el módulo

