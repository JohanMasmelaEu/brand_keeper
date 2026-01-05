# Orden de Ejecución de Scripts de Migración

Este documento describe el orden correcto para ejecutar los scripts de migración de la base de datos.

## ⚠️ IMPORTANTE

- Todos los scripts son **idempotentes** (pueden ejecutarse múltiples veces sin errores)
- Ejecuta los scripts en el **orden indicado**
- Ejecuta cada script en el **SQL Editor de Supabase Dashboard**
- Verifica que cada script se ejecute correctamente antes de continuar con el siguiente

---

## Orden de Ejecución

### 1️⃣ **Esquema Base** (Primero - Requerido)

**Archivo**: `context/DATABASE_SCHEMA.sql`

**Qué hace**:
- Crea el enum `user_role`
- Crea la tabla `companies` (empresas matriz e hijas)
- Crea la tabla `user_profiles` (perfiles de usuario)
- Crea funciones auxiliares (`user_has_role`, `update_updated_at_column`)
- Crea políticas RLS básicas
- Crea índices

**Dependencias**: Ninguna (es el script base)

**Ubicación**: `context/DATABASE_SCHEMA.sql`

---

### 2️⃣ **Tabla de Países** (Opcional pero recomendado)

**Archivo**: `context/CREATE_COUNTRIES_TABLE.sql`

**Qué hace**:
- Crea la tabla `countries`
- Inserta países iniciales (España, Colombia, etc.)

**Dependencias**: Ninguna

**Ubicación**: `context/CREATE_COUNTRIES_TABLE.sql`

---

### 3️⃣ **Tabla de Redes Sociales de Empresas** (Opcional)

**Archivo**: `context/CREATE_COMPANY_SOCIAL_MEDIA.sql`

**Qué hace**:
- Crea el enum `social_media_type`
- Crea la tabla `company_social_media`
- Crea políticas RLS

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `companies`)

**Ubicación**: `context/CREATE_COMPANY_SOCIAL_MEDIA.sql`

---

### 4️⃣ **Tabla de Configuración de Marca**

**Archivo**: `scripts/migrations/create_brand_settings_table.sql`

**Qué hace**:
- Crea la tabla `brand_settings`
- Crea políticas RLS para brand_settings
- Crea índices

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `companies`)

**Ubicación**: `scripts/migrations/create_brand_settings_table.sql`

---

### 5️⃣ **Campos Extendidos de Brand Settings**

**Archivo**: `scripts/migrations/add_brand_settings_extended_fields.sql`

**Qué hace**:
- Agrega campos `tertiary_color`, `negative_color`, `secondary_font`, `contrast_font` a `brand_settings`

**Dependencias**: 
- ✅ `create_brand_settings_table.sql` (la tabla debe existir)

**Ubicación**: `scripts/migrations/add_brand_settings_extended_fields.sql`

---

### 6️⃣ **Tabla de Plantillas de Firma de Correo**

**Archivo**: `context/CREATE_EMAIL_SIGNATURE_TEMPLATES.sql`

**Qué hace**:
- Crea el enum `email_signature_template_type`
- Crea la tabla `email_signature_templates`
- Crea políticas RLS para email_signature_templates

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `companies`)

**Ubicación**: `context/CREATE_EMAIL_SIGNATURE_TEMPLATES.sql`

---

### 7️⃣ **Campo Google Font en Email Signatures**

**Archivo**: `scripts/migrations/add-google-font-to-email-signatures.sql`

**Qué hace**:
- Agrega el campo `google_font` a `email_signature_templates`

**Dependencias**: 
- ✅ `CREATE_EMAIL_SIGNATURE_TEMPLATES.sql` (la tabla debe existir)

**Ubicación**: `scripts/migrations/add-google-font-to-email-signatures.sql`

---

### 8️⃣ **Políticas de Storage para Logos**

**Archivo**: `scripts/migrations/create_brand_logos_storage_policies.sql`

**Qué hace**:
- Crea políticas RLS para el bucket de storage `brand-logos`
- Permite subir/leer/eliminar logos según permisos

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `user_profiles`)
- ⚠️ **IMPORTANTE**: Antes de ejecutar, crea el bucket `brand-logos` en Supabase Storage:
  1. Ve a Storage en el dashboard de Supabase
  2. Crea un nuevo bucket llamado `brand-logos`
  3. Configúralo como **público** para lectura

**Ubicación**: `scripts/migrations/create_brand_logos_storage_policies.sql`

---

### 9️⃣ **Política RLS para Super Admin Actualizar Usuarios**

**Archivo**: `scripts/migrations/add-super-admin-update-user-policy.sql`

**Qué hace**:
- Agrega política RLS para que `super_admin` pueda actualizar cualquier perfil de usuario

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `user_profiles` y función `user_has_role`)

**Ubicación**: `scripts/migrations/add-super-admin-update-user-policy.sql`

---

### 🔟 **Permitir Super Admin Matriz Crear Super Admins en Hijas**

**Archivo**: `scripts/migrations/allow-parent-super-admin-create-child-super-admins.sql`

**Qué hace**:
- Actualiza la función del trigger para permitir que super_admin de empresa matriz cree super_admins en empresas hijas

**Dependencias**: 
- ✅ `DATABASE_SCHEMA.sql` (necesita tabla `user_profiles` y `companies`)

**Ubicación**: `scripts/migrations/allow-parent-super-admin-create-child-super-admins.sql`

---

## 📋 Resumen del Orden

```
1. context/DATABASE_SCHEMA.sql                          ⭐ BASE (OBLIGATORIO)
2. context/CREATE_COUNTRIES_TABLE.sql                   (Opcional)
3. context/CREATE_COMPANY_SOCIAL_MEDIA.sql              (Opcional)
4. scripts/migrations/create_brand_settings_table.sql
5. scripts/migrations/add_brand_settings_extended_fields.sql
6. context/CREATE_EMAIL_SIGNATURE_TEMPLATES.sql
7. scripts/migrations/add-google-font-to-email-signatures.sql
8. scripts/migrations/create_brand_logos_storage_policies.sql  ⚠️ (Crear bucket primero)
9. scripts/migrations/add-super-admin-update-user-policy.sql
10. scripts/migrations/allow-parent-super-admin-create-child-super-admins.sql
```

---

## 🚀 Cómo Ejecutar

### Opción 1: SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard
2. Abre el **SQL Editor**
3. Copia y pega cada script en orden
4. Ejecuta cada script
5. Verifica que no haya errores antes de continuar

### Opción 2: Supabase CLI (Si está configurado)

```powershell
# Desde la raíz del proyecto
supabase db push
```

---

## ✅ Verificación

Después de ejecutar todos los scripts, verifica que:

1. ✅ Tabla `companies` existe
2. ✅ Tabla `user_profiles` existe
3. ✅ Tabla `brand_settings` existe con campos extendidos
4. ✅ Tabla `email_signature_templates` existe con campo `google_font`
5. ✅ Tabla `countries` existe (si ejecutaste ese script)
6. ✅ Bucket `brand-logos` existe en Storage
7. ✅ Políticas RLS están activas

---

## 🔄 Si Necesitas Re-ejecutar

Todos los scripts son idempotentes, así que puedes ejecutarlos nuevamente sin problemas. Sin embargo, mantén el orden para evitar errores temporales.

---

## 📝 Notas

- El script `DATABASE_SCHEMA.sql` es el **único obligatorio** para que la aplicación funcione
- Los demás scripts agregan funcionalidades adicionales
- Si ya tienes datos en producción, los scripts son seguros (no eliminan datos)
- Los scripts usan `IF NOT EXISTS` y `DROP IF EXISTS` para ser idempotentes

