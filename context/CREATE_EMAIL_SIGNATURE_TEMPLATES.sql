-- Brand Keeper - Tabla de Plantillas de Firma de Correo
-- Este script crea la tabla email_signature_templates y sus políticas RLS
-- Es idempotente: puede ejecutarse múltiples veces sin errores

-- ============================================
-- ENUM PARA TIPOS DE PLANTILLA
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_signature_template_type') THEN
    CREATE TYPE email_signature_template_type AS ENUM ('simple', 'with_photo', 'vertical');
  END IF;
END $$;

-- ============================================
-- TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS email_signature_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type email_signature_template_type NOT NULL DEFAULT 'simple',
  html_content TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- Nota: La validación de que solo la empresa matriz puede crear plantillas globales
  -- se maneja en la aplicación (lib/supabase/email-signature.ts)
  -- PostgreSQL no permite subconsultas en CHECK constraints
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_email_signature_templates_company_id ON email_signature_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_email_signature_templates_is_global ON email_signature_templates(is_global);
CREATE INDEX IF NOT EXISTS idx_email_signature_templates_is_active ON email_signature_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_signature_templates_template_type ON email_signature_templates(template_type);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at automáticamente
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_email_signature_templates_updated_at ON public.email_signature_templates;
  
  CREATE TRIGGER update_email_signature_templates_updated_at
    BEFORE UPDATE ON email_signature_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE email_signature_templates ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver plantillas activas de su empresa o globales
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view active templates" ON public.email_signature_templates;
  
  CREATE POLICY "Users can view active templates"
    ON public.email_signature_templates FOR SELECT
    TO authenticated
    USING (
      is_active = true AND (
        -- Plantillas globales (de la empresa matriz)
        is_global = true OR
        -- Plantillas de su propia empresa
        company_id = get_user_company_id(auth.uid())
      )
    );
END $$;

-- Política: Super Admin puede ver todas las plantillas (activas e inactivas)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super admin can view all templates" ON public.email_signature_templates;
  
  CREATE POLICY "Super admin can view all templates"
    ON public.email_signature_templates FOR SELECT
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'));
END $$;

-- Política: Admin puede ver todas las plantillas de su empresa (activas e inactivas) + globales
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can view company templates" ON public.email_signature_templates;
  
  CREATE POLICY "Admin can view company templates"
    ON public.email_signature_templates FOR SELECT
    TO authenticated
    USING (
      user_has_role(auth.uid(), 'admin') AND (
        -- Plantillas globales
        is_global = true OR
        -- Plantillas de su propia empresa
        company_id = get_user_company_id(auth.uid())
      )
    );
END $$;

-- Política: Solo Super Admin y Admin pueden insertar plantillas
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can insert templates" ON public.email_signature_templates;
  
  CREATE POLICY "Admins can insert templates"
    ON public.email_signature_templates FOR INSERT
    TO authenticated
    WITH CHECK (
      user_has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::user_role[]) AND
      (
        -- Super Admin puede crear en cualquier empresa
        user_has_role(auth.uid(), 'super_admin') OR
        -- Admin solo puede crear en su propia empresa
        company_id = get_user_company_id(auth.uid())
      )
    );
END $$;

-- Política: Solo Super Admin y Admin pueden actualizar plantillas
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can update templates" ON public.email_signature_templates;
  
  CREATE POLICY "Admins can update templates"
    ON public.email_signature_templates FOR UPDATE
    TO authenticated
    USING (
      user_has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::user_role[]) AND
      (
        -- Super Admin puede actualizar cualquier plantilla
        user_has_role(auth.uid(), 'super_admin') OR
        -- Admin solo puede actualizar plantillas de su empresa (no globales)
        (company_id = get_user_company_id(auth.uid()) AND is_global = false)
      )
    )
    WITH CHECK (
      user_has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::user_role[]) AND
      (
        -- Super Admin puede actualizar cualquier plantilla
        user_has_role(auth.uid(), 'super_admin') OR
        -- Admin solo puede actualizar plantillas de su empresa (no globales)
        (company_id = get_user_company_id(auth.uid()) AND is_global = false)
      )
    );
END $$;

-- Política: Solo Super Admin y Admin pueden eliminar plantillas
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can delete templates" ON public.email_signature_templates;
  
  CREATE POLICY "Admins can delete templates"
    ON public.email_signature_templates FOR DELETE
    TO authenticated
    USING (
      user_has_any_role(auth.uid(), ARRAY['super_admin', 'admin']::user_role[]) AND
      (
        -- Super Admin puede eliminar cualquier plantilla
        user_has_role(auth.uid(), 'super_admin') OR
        -- Admin solo puede eliminar plantillas de su empresa (no globales)
        (company_id = get_user_company_id(auth.uid()) AND is_global = false)
      )
    );
END $$;

