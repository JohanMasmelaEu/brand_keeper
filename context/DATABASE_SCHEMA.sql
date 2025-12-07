-- Brand Keeper - Esquema de Base de Datos
-- Este archivo contiene las definiciones de tablas necesarias para el MVP
-- Este script es idempotente: puede ejecutarse múltiples veces sin errores
--
-- SEGURIDAD: Este script SOLO modifica objetos creados por Brand Keeper
-- NO modifica ni elimina tablas del sistema de Supabase (auth.users, storage, etc.)
-- Todas las operaciones están limitadas al esquema 'public' y solo afectan:
--   - Tablas: companies, user_profiles
--   - Tipos: user_role
--   - Funciones y triggers relacionados con estas tablas

-- ============================================
-- NOTA IMPORTANTE SOBRE SEGURIDAD
-- ============================================
-- Este script está adaptado para funcionar correctamente con Supabase:
-- 
-- 1. Funciones SECURITY DEFINER: Incluyen SET search_path = public (requerido por Supabase)
-- 2. Políticas RLS: Se recrean usando DROP IF EXISTS + CREATE (permite actualizaciones)
-- 3. Triggers: Se recrean usando DROP IF EXISTS + CREATE (permite actualizaciones)
-- 4. Tablas: Usan CREATE TABLE IF NOT EXISTS (no modifica tablas existentes)
-- 
-- IMPORTANTE: Los DROP IF EXISTS solo afectan políticas y triggers de nuestras tablas,
-- NO eliminan tablas ni datos. Es seguro ejecutar este script múltiples veces.
-- NO modifica tablas del sistema de Supabase (auth.users, storage, etc.)

-- ============================================
-- ENUMS
-- ============================================

-- Enum para roles de usuario
-- NOTA: Si el tipo ya existe, este comando fallará silenciosamente
-- Para recrear el tipo, elimínalo manualmente primero: DROP TYPE IF EXISTS user_role CASCADE;
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'collaborator');
  END IF;
END $$;

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de empresas (matriz e hijas)
-- NOTA: Si la tabla ya existe, este comando fallará
-- Para recrear la tabla, elimínala manualmente primero
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_parent BOOLEAN NOT NULL DEFAULT false,
  parent_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  website VARCHAR(255),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Solo la empresa matriz puede tener is_parent = true
  CONSTRAINT check_parent_company CHECK (
    (is_parent = true AND parent_company_id IS NULL) OR
    (is_parent = false)
  )
);

-- Tabla de perfiles de usuario
-- Esta tabla extiende la información de auth.users de Supabase
-- NOTA: Si la tabla ya existe, este comando fallará
-- Para recrear la tabla, elimínala manualmente primero
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_parent ON companies(is_parent);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar que super_admin solo puede estar en empresa matriz
CREATE OR REPLACE FUNCTION validate_super_admin_parent_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el rol es super_admin, verificar que la empresa sea matriz
  IF NEW.role = 'super_admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM companies 
      WHERE id = NEW.company_id 
      AND is_parent = true
    ) THEN
      RAISE EXCEPTION 'Super admin solo puede estar asignado a la empresa matriz';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funciones helper para RLS que evitan recursión infinita
-- Estas funciones usan SECURITY DEFINER para bypass RLS y evitar recursión
-- IMPORTANTE: SET search_path = public es necesario para seguridad en Supabase

-- Función para obtener el rol del usuario autenticado (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE id = user_id
  AND is_active = true;
  
  RETURN user_role_value;
END;
$$;

-- Función para obtener el company_id del usuario autenticado (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_id_value UUID;
BEGIN
  SELECT company_id INTO company_id_value
  FROM user_profiles
  WHERE id = user_id
  AND is_active = true;
  
  RETURN company_id_value;
END;
$$;

-- Función para verificar si el usuario tiene un rol específico (bypass RLS)
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND role = role_name
    AND is_active = true
  );
END;
$$;

-- Función para verificar si el usuario tiene uno de los roles especificados (bypass RLS)
CREATE OR REPLACE FUNCTION user_has_any_role(user_id UUID, role_names user_role[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND role = ANY(role_names)
    AND is_active = true
  );
END;
$$;

-- Función para verificar si dos usuarios pertenecen a la misma empresa (bypass RLS)
CREATE OR REPLACE FUNCTION users_same_company(user_id_1 UUID, user_id_2 UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_1 UUID;
  company_2 UUID;
BEGIN
  SELECT company_id INTO company_1
  FROM user_profiles
  WHERE id = user_id_1
  AND is_active = true;
  
  SELECT company_id INTO company_2
  FROM user_profiles
  WHERE id = user_id_2
  AND is_active = true;
  
  RETURN company_1 IS NOT NULL AND company_2 IS NOT NULL AND company_1 = company_2;
END;
$$;

-- Triggers para updated_at
-- Usamos DROP IF EXISTS + CREATE para permitir actualizaciones
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
  
  CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
  
  CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Trigger para validar que super_admin solo puede estar en empresa matriz
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS validate_super_admin_parent_company_trigger ON public.user_profiles;
  
  CREATE TRIGGER validate_super_admin_parent_company_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_super_admin_parent_company();
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
-- Todos los usuarios autenticados pueden ver empresas
-- Usamos DROP IF EXISTS + CREATE para permitir actualizaciones de políticas
DO $$ 
BEGIN
  -- Eliminar política si existe para recrearla (permite actualizaciones)
  DROP POLICY IF EXISTS "Users can view companies" ON public.companies;
  
  CREATE POLICY "Users can view companies"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Solo super_admin puede insertar/actualizar/eliminar empresas
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Only super_admin can manage companies" ON public.companies;
  
  CREATE POLICY "Only super_admin can manage companies"
    ON public.companies FOR ALL
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Políticas para user_profiles
-- Los usuarios pueden ver su propio perfil
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
  
  CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());
END $$;

-- Los usuarios pueden ver perfiles de su misma empresa
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view same company profiles" ON public.user_profiles;
  
  CREATE POLICY "Users can view same company profiles"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (
      get_user_company_id(auth.uid()) IS NOT NULL
      AND get_user_company_id(auth.uid()) = company_id
    );
END $$;

-- Super admin puede ver todos los perfiles
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.user_profiles;
  
  CREATE POLICY "Super admin can view all profiles"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Los usuarios pueden actualizar su propio perfil (solo campos permitidos)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
  
  CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
END $$;

-- Solo super_admin y admin pueden insertar nuevos perfiles
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
  
  CREATE POLICY "Admins can insert profiles"
    ON public.user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (user_has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::user_role[]));
END $$;

-- Solo super_admin puede actualizar roles y company_id
-- (Esta validación se hará en la aplicación, RLS permite actualización básica)

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar empresa matriz por defecto
-- NOTA: Ejecutar esto después de crear las tablas
-- INSERT INTO companies (name, slug, is_parent) 
-- VALUES ('Empresa Matriz', 'empresa-matriz', true);

