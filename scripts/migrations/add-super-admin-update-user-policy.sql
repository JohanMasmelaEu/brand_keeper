-- ============================================
-- MIGRACIÓN: Agregar política RLS para que super_admin pueda actualizar cualquier perfil
-- Fecha: 2024
-- ============================================

-- Política para que super_admin pueda actualizar cualquier perfil de usuario
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Super admin can update any profile" ON public.user_profiles;
  
  CREATE POLICY "Super admin can update any profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (user_has_role(auth.uid(), 'super_admin'))
    WITH CHECK (user_has_role(auth.uid(), 'super_admin'));
END $$;

