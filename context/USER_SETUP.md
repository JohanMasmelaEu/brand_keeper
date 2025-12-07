# Configuración de Usuarios y Perfiles

Este documento explica cómo configurar el sistema de usuarios y perfiles en Brand Keeper.

## Pasos de Configuración

### 1. Ejecutar el Esquema SQL

Primero, necesitas crear las tablas en Supabase ejecutando el esquema SQL:

1. Ve al Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `context/DATABASE_SCHEMA.sql`
5. Copia todo el contenido del archivo
6. Pégalo en el SQL Editor
7. Ejecuta el script (botón "Run" o `Ctrl+Enter`)

**Importante**: Asegúrate de que el script se ejecute completamente sin errores.

### 2. Instalar Dependencias del Script

El script de creación de usuarios requiere algunas dependencias adicionales:

```powershell
pnpm install
```

Esto instalará `dotenv` y `tsx` que son necesarios para ejecutar el script.

### 3. Crear Usuarios de Prueba

Una vez que el esquema SQL esté ejecutado, puedes crear los usuarios de prueba ejecutando:

```powershell
pnpm create-test-users
```

Este script creará:

- **Empresa Matriz**: "Empresa Matriz" (slug: `empresa-matriz`)
- **Empresa Hija**: "Empresa Hija 1" (slug: `empresa-hija-1`)
- **Super Admin**: 
  - Email: `superadmin@brandkeeper.test`
  - Password: `SuperAdmin123!`
  - Asignado a: Empresa Matriz
- **Admin**: 
  - Email: `admin@brandkeeper.test`
  - Password: `Admin123!`
  - Asignado a: Empresa Hija 1
- **Colaborador**: 
  - Email: `colaborador@brandkeeper.test`
  - Password: `Colaborador123!`
  - Asignado a: Empresa Hija 1

### 4. Verificar la Configuración

Después de ejecutar el script, deberías poder:

1. Iniciar sesión con cualquiera de los usuarios de prueba
2. Ser redirigido automáticamente al dashboard (`/dashboard`) que se adapta según tu rol:
   - Super Admin → Dashboard con opciones de gestión completa
   - Admin → Dashboard con opciones de gestión de empresa
   - Colaborador → Dashboard con opciones de visualización y generación de firma

## Estructura de Roles

### Super Admin
- **Pertenencia**: Solo empresa matriz
- **Capacidades**:
  - Gestionar todas las empresas
  - Crear y gestionar usuarios de cualquier empresa
  - Configurar marca matriz
  - Acceso total a todos los módulos

### Admin
- **Pertenencia**: Empresa hija o matriz
- **Capacidades**:
  - Gestionar contenidos de su empresa
  - Crear y gestionar colaboradores de su empresa
  - Configurar marca de su empresa
  - No puede ver/edit contenidos de otras empresas

### Colaborador
- **Pertenencia**: Cualquier empresa
- **Capacidades**:
  - Ver y usar recursos de su empresa
  - Ver recursos globales de la empresa matriz
  - Generar su firma de correo
  - Solo lectura, no puede editar ni cargar contenido

## Solución de Problemas

### Error: "relation does not exist"
- **Causa**: El esquema SQL no se ha ejecutado correctamente
- **Solución**: Verifica que todas las tablas estén creadas en Supabase > Table Editor

### Error: "permission denied for table"
- **Causa**: Las políticas RLS están bloqueando el acceso
- **Solución**: Verifica que las políticas RLS estén correctamente configuradas en el esquema SQL

### Error: "duplicate key value violates unique constraint"
- **Causa**: Los usuarios o empresas ya existen
- **Solución**: El script detecta esto automáticamente y actualiza los registros existentes

### Usuario no es redirigido al dashboard correcto
- **Causa**: El perfil del usuario no está creado o el rol no está configurado
- **Solución**: 
  1. Verifica en Supabase > Table Editor > `user_profiles` que el usuario tenga un perfil
  2. Verifica que el campo `role` esté correctamente configurado
  3. Verifica que `is_active` sea `true`

## Crear Usuarios Manualmente

Si necesitas crear usuarios manualmente:

1. **Crear usuario en Supabase Auth**:
   - Ve a Supabase Dashboard > Authentication > Users
   - Crea un nuevo usuario con email y password

2. **Crear perfil en la base de datos**:
   - Ve a Supabase Dashboard > SQL Editor
   - Ejecuta:

```sql
INSERT INTO user_profiles (id, email, full_name, role, company_id, is_active)
VALUES (
  'USER_ID_FROM_AUTH',  -- Reemplaza con el ID del usuario de auth
  'email@example.com',
  'Nombre Completo',
  'admin',  -- o 'super_admin' o 'collaborator'
  'COMPANY_ID',  -- Reemplaza con el ID de la empresa
  true
);
```

**Nota**: Para Super Admin, asegúrate de que `company_id` apunte a una empresa con `is_parent = true`.

## Actualizar Tipos de TypeScript

Después de crear las tablas, deberías regenerar los tipos de TypeScript desde Supabase:

```powershell
# Si tienes Supabase CLI instalado
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
```

O actualiza manualmente `lib/types/database.types.ts` con las definiciones de las nuevas tablas.

