-- Políticas RLS simplificadas para el bucket de avatares de usuario
-- Ejecutar en Supabase SQL Editor

-- IMPORTANTE: Estas políticas permiten que cualquier usuario autenticado suba/lea/actualice/elimine
-- sus propios avatares basándose en que el nombre del archivo contiene su user_id

-- 1. Permitir que los usuarios suban imágenes en la carpeta avatars/
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] LIKE (auth.uid()::text || '-%')
);

-- 2. Permitir que los usuarios lean imágenes en la carpeta avatars/ que contengan su user_id
CREATE POLICY "Users can read own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] LIKE (auth.uid()::text || '-%')
);

-- 3. Permitir que los usuarios actualicen sus propias imágenes
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] LIKE (auth.uid()::text || '-%')
)
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] LIKE (auth.uid()::text || '-%')
);

-- 4. Permitir que los usuarios eliminen sus propias imágenes
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] LIKE (auth.uid()::text || '-%')
);

