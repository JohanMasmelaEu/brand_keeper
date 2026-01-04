-- ============================================
-- MIGRACIÓN: Permitir que super_admin de empresa matriz cree super_admins en empresas hijas
-- Fecha: 2024
-- ============================================

-- Actualizar la función del trigger para permitir que el super_admin de la empresa matriz
-- pueda crear super_admins en empresas hijas
CREATE OR REPLACE FUNCTION validate_super_admin_parent_company()
RETURNS TRIGGER AS $$
DECLARE
  current_user_company_id UUID;
  current_user_company_is_parent BOOLEAN;
BEGIN
  -- Si el rol es super_admin, verificar que la empresa sea matriz
  IF NEW.role = 'super_admin' THEN
    -- Verificar si la empresa destino es matriz
    IF NOT EXISTS (
      SELECT 1 FROM companies 
      WHERE id = NEW.company_id 
      AND is_parent = true
    ) THEN
      -- La empresa destino NO es matriz, verificar si el usuario actual es super_admin de la matriz
      -- Obtener el company_id del usuario actual
      SELECT company_id INTO current_user_company_id
      FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true;
      
      -- Si no se encontró el usuario actual o no es super_admin, rechazar
      IF current_user_company_id IS NULL THEN
        RAISE EXCEPTION 'Super admin solo puede estar asignado a la empresa matriz';
      END IF;
      
      -- Verificar si la empresa del usuario actual es matriz
      SELECT is_parent INTO current_user_company_is_parent
      FROM companies
      WHERE id = current_user_company_id;
      
      -- Si el usuario actual NO es de la empresa matriz, rechazar
      IF current_user_company_is_parent IS NOT TRUE THEN
        RAISE EXCEPTION 'Solo el super administrador de la empresa matriz puede crear super administradores en empresas hijas';
      END IF;
      
      -- Si llegamos aquí, el usuario actual es super_admin de la matriz, permitir
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- El trigger ya existe, solo necesitamos actualizar la función
-- No es necesario recrear el trigger

