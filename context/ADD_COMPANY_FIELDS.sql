-- Script para agregar campos adicionales a la tabla companies
-- Ejecutar este script en Supabase SQL Editor después de tener la tabla companies creada

-- Agregar campo de nombre legal
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);

-- Agregar campo de dirección
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Agregar campo de país
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Comentarios para documentación
COMMENT ON COLUMN companies.legal_name IS 'Nombre legal de la empresa (razón social)';
COMMENT ON COLUMN companies.address IS 'Dirección completa de la empresa';
COMMENT ON COLUMN companies.country IS 'País donde opera la empresa';

