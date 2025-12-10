-- Script para crear la tabla de países
-- Ejecutar este script en Supabase SQL Editor

-- Crear tabla de países
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE, -- Código ISO 3166-1 alpha-2
  region VARCHAR(50), -- Región: 'europe', 'south_america', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region);

-- Comentarios para documentación
COMMENT ON TABLE countries IS 'Tabla de países disponibles para selección en empresas';
COMMENT ON COLUMN countries.name IS 'Nombre completo del país';
COMMENT ON COLUMN countries.code IS 'Código ISO 3166-1 alpha-2 del país';
COMMENT ON COLUMN countries.region IS 'Región geográfica del país';

-- Insertar países relevantes
-- España (empresa matriz)
INSERT INTO countries (name, code, region) VALUES
  ('España', 'ES', 'europe')
ON CONFLICT (code) DO NOTHING;

-- Países sudamericanos (adquisiciones actuales)
INSERT INTO countries (name, code, region) VALUES
  ('Argentina', 'AR', 'south_america'),
  ('Bolivia', 'BO', 'south_america'),
  ('Brasil', 'BR', 'south_america'),
  ('Chile', 'CL', 'south_america'),
  ('Colombia', 'CO', 'south_america'),
  ('Ecuador', 'EC', 'south_america'),
  ('Paraguay', 'PY', 'south_america'),
  ('Perú', 'PE', 'south_america'),
  ('Uruguay', 'UY', 'south_america'),
  ('Venezuela', 'VE', 'south_america')
ON CONFLICT (code) DO NOTHING;

-- Países europeos (planes de expansión)
INSERT INTO countries (name, code, region) VALUES
  ('Alemania', 'DE', 'europe'),
  ('Francia', 'FR', 'europe'),
  ('Italia', 'IT', 'europe'),
  ('Portugal', 'PT', 'europe'),
  ('Reino Unido', 'GB', 'europe'),
  ('Países Bajos', 'NL', 'europe'),
  ('Bélgica', 'BE', 'europe'),
  ('Suiza', 'CH', 'europe'),
  ('Austria', 'AT', 'europe'),
  ('Polonia', 'PL', 'europe')
ON CONFLICT (code) DO NOTHING;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_countries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_countries_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden leer países
CREATE POLICY "Countries are viewable by authenticated users"
  ON countries
  FOR SELECT
  TO authenticated
  USING (true);

