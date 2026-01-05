-- Brand Keeper - Políticas RLS para el bucket de logos de marca
-- Este script crea las políticas de storage para el bucket brand-logos
-- Es idempotente: puede ejecutarse múltiples veces sin errores

-- IMPORTANTE: Antes de ejecutar este script, asegúrate de crear el bucket "brand-logos" en Supabase Storage
-- El bucket debe ser público para lectura

-- ============================================
-- POLÍTICAS PARA EL BUCKET: brand-logos
-- ============================================

-- Estructura de archivos: brand-logos/{company_id}/logo.{ext}

-- 1. Política para INSERT (subir logos)
-- Super Admin puede subir logos para cualquier empresa
-- Admin puede subir logos solo para su empresa
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can upload logos for any company" ON storage.objects;
  
  CREATE POLICY "Super Admin can upload logos for any company"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'brand-logos'
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'super_admin'
        AND user_profiles.is_active = true
      )
    );
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can upload logos for own company" ON storage.objects;
  
  CREATE POLICY "Admin can upload logos for own company"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'brand-logos'
      AND (storage.foldername(name))[1] = (
        SELECT company_id::text FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
      )
    );
END $$;

-- 2. Política para SELECT (leer logos)
-- Todos los usuarios autenticados pueden leer logos de su empresa y empresas globales (matriz)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read logos from own company and parent" ON storage.objects;
  
  CREATE POLICY "Users can read logos from own company and parent"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'brand-logos'
      AND (
        -- Pueden leer logos de su empresa
        (storage.foldername(name))[1] = (
          SELECT company_id::text FROM user_profiles
          WHERE id = auth.uid()
          AND is_active = true
        )
        -- O pueden leer logos de la empresa matriz (globales)
        OR EXISTS (
          SELECT 1 FROM companies
          WHERE companies.id::text = (storage.foldername(name))[1]
          AND companies.is_parent = true
        )
      )
    );
END $$;

-- 3. Política para UPDATE (actualizar logos)
-- Super Admin puede actualizar logos de cualquier empresa
-- Admin puede actualizar logos solo de su empresa
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can update logos for any company" ON storage.objects;
  
  CREATE POLICY "Super Admin can update logos for any company"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'brand-logos'
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'super_admin'
        AND user_profiles.is_active = true
      )
    )
    WITH CHECK (
      bucket_id = 'brand-logos'
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'super_admin'
        AND user_profiles.is_active = true
      )
    );
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can update logos for own company" ON storage.objects;
  
  CREATE POLICY "Admin can update logos for own company"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'brand-logos'
      AND (storage.foldername(name))[1] = (
        SELECT company_id::text FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
      )
    )
    WITH CHECK (
      bucket_id = 'brand-logos'
      AND (storage.foldername(name))[1] = (
        SELECT company_id::text FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
      )
    );
END $$;

-- 4. Política para DELETE (eliminar logos)
-- Super Admin puede eliminar logos de cualquier empresa
-- Admin puede eliminar logos solo de su empresa
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super Admin can delete logos for any company" ON storage.objects;
  
  CREATE POLICY "Super Admin can delete logos for any company"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'brand-logos'
      AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'super_admin'
        AND user_profiles.is_active = true
      )
    );
END $$;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin can delete logos for own company" ON storage.objects;
  
  CREATE POLICY "Admin can delete logos for own company"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'brand-logos'
      AND (storage.foldername(name))[1] = (
        SELECT company_id::text FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
      )
    );
END $$;

-- NOTA: 
-- - Las imágenes se guardan con el formato: {company_id}/logo-{timestamp}.{ext}
-- - El bucket debe ser público para lectura
-- - Las políticas aseguran que solo usuarios autorizados pueden modificar/eliminar logos

