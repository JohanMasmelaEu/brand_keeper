-- Brand Keeper - Migración: Agregar campo google_font a email_signature_templates
-- Este script agrega el campo google_font para permitir usar Google Fonts en las firmas
-- Es idempotente: puede ejecutarse múltiples veces sin errores

-- ============================================
-- AGREGAR CAMPO google_font
-- ============================================

DO $$ 
BEGIN
  -- Agregar la columna si no existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'email_signature_templates' 
    AND column_name = 'google_font'
  ) THEN
    ALTER TABLE email_signature_templates 
    ADD COLUMN google_font VARCHAR(100) NULL;
    
    COMMENT ON COLUMN email_signature_templates.google_font IS 
      'Nombre de la fuente de Google Fonts a usar en la firma. Se incluirá automáticamente en el HTML generado.';
  END IF;
END $$;

