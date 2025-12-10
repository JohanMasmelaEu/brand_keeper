-- Script para crear la tabla de redes sociales de empresas
-- Ejecutar este script en Supabase SQL Editor

-- Enum para tipos de redes sociales
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_media_type') THEN
    CREATE TYPE social_media_type AS ENUM (
      'facebook',
      'instagram',
      'twitter',
      'linkedin',
      'youtube',
      'tiktok',
      'whatsapp',
      'pinterest',
      'snapchat',
      'threads'
    );
  END IF;
END $$;

-- Tabla de redes sociales de empresas
CREATE TABLE IF NOT EXISTS company_social_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type social_media_type NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Una empresa solo puede tener una red social de cada tipo
  CONSTRAINT unique_company_social_type UNIQUE (company_id, type)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_company_social_media_company_id ON company_social_media(company_id);
CREATE INDEX IF NOT EXISTS idx_company_social_media_type ON company_social_media(type);
CREATE INDEX IF NOT EXISTS idx_company_social_media_active ON company_social_media(is_active);

-- Comentarios para documentación
COMMENT ON TABLE company_social_media IS 'Redes sociales asociadas a cada empresa';
COMMENT ON COLUMN company_social_media.company_id IS 'ID de la empresa propietaria de la red social';
COMMENT ON COLUMN company_social_media.type IS 'Tipo de red social (facebook, instagram, twitter, etc.)';
COMMENT ON COLUMN company_social_media.url IS 'URL completa del perfil o página de la red social';
COMMENT ON COLUMN company_social_media.is_active IS 'Indica si la red social está activa o no';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_company_social_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_company_social_media_updated_at ON public.company_social_media;
  
  CREATE TRIGGER update_company_social_media_updated_at
    BEFORE UPDATE ON company_social_media
    FOR EACH ROW
    EXECUTE FUNCTION update_company_social_media_updated_at();
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE company_social_media ENABLE ROW LEVEL SECURITY;

-- Políticas para company_social_media
-- Todos los usuarios autenticados pueden ver redes sociales de empresas
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view company social media" ON public.company_social_media;
  
  CREATE POLICY "Users can view company social media"
    ON public.company_social_media FOR SELECT
    TO authenticated
    USING (true);
END $$;

-- Solo super_admin y admin de la empresa pueden gestionar redes sociales
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage company social media" ON public.company_social_media;
  
  CREATE POLICY "Admins can manage company social media"
    ON public.company_social_media FOR ALL
    TO authenticated
    USING (
      user_has_role(auth.uid(), 'super_admin') OR
      (
        user_has_role(auth.uid(), 'admin') AND
        company_id IN (
          SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
      )
    )
    WITH CHECK (
      user_has_role(auth.uid(), 'super_admin') OR
      (
        user_has_role(auth.uid(), 'admin') AND
        company_id IN (
          SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
      )
    );
END $$;

