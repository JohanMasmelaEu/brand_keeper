-- Brand Keeper - Migración para agregar campos extendidos a brand_settings
-- Agrega tertiary_color, negative_color, secondary_font, contrast_font
-- Es idempotente: puede ejecutarse múltiples veces sin errores

-- ============================================
-- AGREGAR CAMPOS EXTENDIDOS
-- ============================================

-- Agregar tertiary_color
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_settings' 
    AND column_name = 'tertiary_color'
  ) THEN
    ALTER TABLE brand_settings 
    ADD COLUMN tertiary_color VARCHAR(7) CHECK (tertiary_color IS NULL OR tertiary_color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;
END $$;

-- Agregar negative_color
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_settings' 
    AND column_name = 'negative_color'
  ) THEN
    ALTER TABLE brand_settings 
    ADD COLUMN negative_color VARCHAR(7) CHECK (negative_color IS NULL OR negative_color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;
END $$;

-- Agregar secondary_font
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_settings' 
    AND column_name = 'secondary_font'
  ) THEN
    ALTER TABLE brand_settings 
    ADD COLUMN secondary_font VARCHAR(100);
  END IF;
END $$;

-- Agregar contrast_font
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'brand_settings' 
    AND column_name = 'contrast_font'
  ) THEN
    ALTER TABLE brand_settings 
    ADD COLUMN contrast_font VARCHAR(100);
  END IF;
END $$;

