-- Script para corregir la política RLS de company_social_media
-- Este script agrega WITH CHECK que es necesario para INSERT
-- Ejecutar este script en Supabase SQL Editor

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

