-- Brand Keeper - Migración para tabla brand_settings
-- Este script crea la tabla brand_settings y sus políticas RLS
-- Es idempotente: puede ejecutarse múltiples veces sin errores

-- ============================================
-- TABLA: brand_settings
-- ============================================

CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) NOT NULL CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color VARCHAR(7) CHECK (secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_family VARCHAR(100) NOT NULL,
  logo_url TEXT,
  logo_variants JSONB DEFAULT '{}'::jsonb,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, is_global)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_brand_settings_company_id ON brand_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_is_global ON brand_settings(is_global);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at automáticamente
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_brand_settings_updated_at ON public.brand_settings;
  
  CREATE TRIGGER update_brand_settings_updated_at
    BEFORE UPDATE ON brand_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para SELECT (leer configuraciones)
-- Super Admin puede ver todas las configuraciones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can view all brand settings" ON public.brand_settings;
  
  CREATE POLICY "Super Admin can view all brand settings"
    ON public.brand_settings FOR SELECT
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Admin puede ver solo su empresa (no globales)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can view own company brand settings" ON public.brand_settings;
  
  CREATE POLICY "Admin can view own company brand settings"
    ON public.brand_settings FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
        AND user_profiles.company_id = brand_settings.company_id
        AND brand_settings.is_global = false
        AND user_profiles.is_active = true
      )
    );
END $$;

-- Colaboradores pueden ver configuraciones de su empresa y globales
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Collaborators can view company and global brand settings" ON public.brand_settings;
  
  CREATE POLICY "Collaborators can view company and global brand settings"
    ON public.brand_settings FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'collaborator'
        AND (
          user_profiles.company_id = brand_settings.company_id
          OR brand_settings.is_global = true
        )
        AND user_profiles.is_active = true
      )
    );
END $$;

-- Políticas para INSERT (crear configuraciones)
-- Super Admin puede crear para cualquier empresa
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can create brand settings" ON public.brand_settings;
  
  CREATE POLICY "Super Admin can create brand settings"
    ON public.brand_settings FOR INSERT
    TO authenticated
    WITH CHECK (
      user_has_role(auth.uid(), 'super_admin')
    );
END $$;

-- Admin solo puede crear para su empresa (no globales)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can create own company brand settings" ON public.brand_settings;
  
  CREATE POLICY "Admin can create own company brand settings"
    ON public.brand_settings FOR INSERT
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
END $$;

-- Políticas para UPDATE (actualizar configuraciones)
-- Super Admin puede actualizar cualquier configuración
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can update brand settings" ON public.brand_settings;
  
  CREATE POLICY "Super Admin can update brand settings"
    ON public.brand_settings FOR UPDATE
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'))
    WITH CHECK (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Admin solo puede actualizar configuración de su empresa (no globales)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can update own company brand settings" ON public.brand_settings;
  
  CREATE POLICY "Admin can update own company brand settings"
    ON public.brand_settings FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
        AND user_profiles.company_id = brand_settings.company_id
        AND brand_settings.is_global = false
        AND user_profiles.is_active = true
      )
    )
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
END $$;

-- Políticas para DELETE (eliminar configuraciones)
-- Super Admin puede eliminar cualquier configuración
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can delete brand settings" ON public.brand_settings;
  
  CREATE POLICY "Super Admin can delete brand settings"
    ON public.brand_settings FOR DELETE
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Admin solo puede eliminar configuración de su empresa (no globales)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can delete own company brand settings" ON public.brand_settings;
  
  CREATE POLICY "Admin can delete own company brand settings"
    ON public.brand_settings FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
        AND user_profiles.company_id = brand_settings.company_id
        AND brand_settings.is_global = false
        AND user_profiles.is_active = true
      )
    );
END $$;

