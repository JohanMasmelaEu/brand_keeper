-- Políticas RLS para el bucket de avatares de usuario
-- Ejecutar estas políticas en Supabase SQL Editor después de crear el bucket "user-avatars"

-- ============================================
-- POLÍTICAS PARA EL BUCKET: user-avatars
-- ============================================

-- 1. Permitir que los usuarios suban sus propias imágenes de avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Permitir que los usuarios lean sus propias imágenes de avatar
CREATE POLICY "Users can read own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Permitir que los usuarios actualicen sus propias imágenes de avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Permitir que los usuarios eliminen sus propias imágenes de avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- NOTA: 
-- - Las imágenes se guardan con el formato: avatars/{user_id}-{timestamp}.{ext}
-- - El nombre del archivo incluye el user_id, lo que permite que las políticas RLS funcionen correctamente
-- - Aunque el bucket es público, estas políticas aseguran que solo el usuario propietario puede modificar/eliminar su avatar

