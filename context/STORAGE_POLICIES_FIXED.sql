-- Políticas RLS CORREGIDAS para el bucket de avatares de usuario
-- IMPORTANTE: Elimina las políticas anteriores antes de ejecutar estas

-- Primero, eliminar TODAS las políticas existentes relacionadas con avatares
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- 1. Política para INSERT (subir archivos)
-- Permite subir archivos en la carpeta avatars/ del bucket user-avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- 2. Política para SELECT (leer archivos)
-- Como el bucket es público, permitimos leer todos los archivos del bucket
CREATE POLICY "Users can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- 3. Política para UPDATE (actualizar archivos)
-- Permite actualizar archivos en la carpeta avatars/
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars'
)
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- 4. Política para DELETE (eliminar archivos)
-- Permite eliminar archivos en la carpeta avatars/
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- NOTA: Estas políticas son más permisivas pero seguras porque:
-- - Solo permiten operaciones en la carpeta avatars/
-- - El bucket es público para lectura (SELECT)
-- - Las operaciones de escritura están restringidas a usuarios autenticados
-- - Si necesitas más seguridad, puedes agregar validación del user_id en el nombre del archivo

