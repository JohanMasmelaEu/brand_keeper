/**
 * Funciones para gestionar usuarios y perfiles
 */

import { createClient, createAdminClient } from './server'
import type { UserProfile, UserRole, Company } from '@/lib/types/user'

/**
 * Obtiene el perfil completo de un usuario autenticado
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Obtiene el perfil de un usuario por ID (solo para admins)
 */
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile by ID:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Crea un perfil de usuario después de que se crea en auth.users
 * Esta función debe ser llamada desde un trigger o desde el código después de crear el usuario
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: UserRole,
  companyId: string,
  fullName?: string,
  avatarUrl?: string | null
): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role,
      company_id: companyId,
      full_name: fullName || null,
      avatar_url: avatarUrl || null,
    })
    .select(`
      *,
      company:companies(*)
    `)
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Obtiene todas las empresas (con filtros según rol)
 */
export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  // Super admin puede ver todas las empresas
  if (profile.role === 'super_admin') {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
      return []
    }

    return data as Company[]
  }

  // Otros roles solo ven su propia empresa
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return []
  }

  return data ? [data as Company] : []
}

/**
 * Obtiene la empresa matriz
 */
export async function getParentCompany(): Promise<Company | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_parent', true)
    .single()

  if (error) {
    console.error('Error fetching parent company:', error)
    return null
  }

  return data as Company | null
}

/**
 * Verifica si el usuario actual tiene un rol específico
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.role === role
}

/**
 * Verifica si el usuario actual es super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin')
}

/**
 * Verifica si el usuario actual es admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin')
}

/**
 * Verifica si el usuario actual es colaborador
 */
export async function isCollaborator(): Promise<boolean> {
  return hasRole('collaborator')
}

/**
 * Obtiene todos los usuarios (solo para super_admin)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return []
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all users:', error)
    return []
  }

  return (data || []) as UserProfile[]
}

/**
 * Obtiene usuarios por empresa (solo para super_admin o admin de esa empresa)
 */
export async function getUsersByCompany(companyId: string): Promise<UserProfile[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  // Super admin puede ver usuarios de cualquier empresa
  // Admin solo puede ver usuarios de su propia empresa
  if (profile.role === 'super_admin' || (profile.role === 'admin' && profile.company_id === companyId)) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users by company:', error)
      return []
    }

    return (data || []) as UserProfile[]
  }

  return []
}

/**
 * Verifica si un email ya está en uso
 */
async function checkEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()
  const supabase = await createClient()
  
  // Verificar en user_profiles primero (más rápido)
  const { data: existingProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (profileError && profileError.code !== 'PGRST116') {
    // PGRST116 es "no rows returned", que es esperado si no existe
    console.error('Error checking email in user_profiles:', profileError)
  }

  if (existingProfile) {
    return true
  }

  // Verificar en auth.users usando admin client
  // Nota: listUsers puede ser lento con muchos usuarios, pero es la única forma
  // de verificar sin intentar crear el usuario primero
  const adminClient = createAdminClient()
  try {
    const { data: { users }, error } = await adminClient.auth.admin.listUsers()
    
    if (error) {
      console.error('Error checking email in auth:', error)
      // Si hay error al verificar, retornamos false y dejamos que
      // la creación del usuario falle con un mensaje más claro
      return false
    }

    const emailExists = users?.some(user => 
      user.email?.toLowerCase().trim() === normalizedEmail
    ) || false

    return emailExists
  } catch (error) {
    console.error('Exception checking email in auth:', error)
    return false
  }
}

/**
 * Crea un nuevo usuario en auth.users y su perfil
 * Solo para super_admin
 */
export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  companyId: string,
  fullName?: string,
  avatarUrl?: string | null
): Promise<{ user: UserProfile | null; error?: string }> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return { user: null, error: 'No tienes permisos para crear usuarios' }
  }

  // Verificar que la empresa existe
  const { data: company } = await supabase
    .from('companies')
    .select('id, is_parent')
    .eq('id', companyId)
    .single()

  if (!company) {
    return { user: null, error: 'La empresa especificada no existe' }
  }

  // Verificar si el usuario actual es de la empresa matriz
  const { data: currentUserCompany } = await supabase
    .from('companies')
    .select('id, is_parent')
    .eq('id', profile.company_id)
    .single()

  const isCurrentUserFromParentCompany = currentUserCompany?.is_parent === true

  // Validar que super_admin solo puede estar en empresa matriz
  // EXCEPCIÓN: El super_admin de la empresa matriz puede crear super_admins en empresas hijas
  if (role === 'super_admin' && !company.is_parent) {
    if (!isCurrentUserFromParentCompany) {
      return { user: null, error: 'Solo el super administrador de la empresa matriz puede crear super administradores en empresas hijas' }
    }
    // Si el usuario actual es de la empresa matriz, permitir crear super_admin en empresa hija
  } else if (role === 'super_admin' && company.is_parent) {
    // Si se está creando un super_admin en la empresa matriz, solo permitirlo si el usuario actual es de la matriz
    if (!isCurrentUserFromParentCompany) {
      return { user: null, error: 'Solo el super administrador de la empresa matriz puede crear super administradores' }
    }
  }

  // Verificar si el email ya está en uso
  const emailExists = await checkEmailExists(email)
  if (emailExists) {
    return { user: null, error: 'El correo electrónico ya está en uso' }
  }

  // Crear usuario en auth.users usando admin client
  // Necesitamos usar el service role key para esto
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
  })

  if (authError) {
    // Verificar si el error es porque el email ya existe
    if (
      authError.message?.includes('already registered') ||
      authError.message?.includes('already exists') ||
      authError.message?.includes('User already registered') ||
      authError.message?.includes('email address is already registered')
    ) {
      return { user: null, error: 'El correo electrónico ya está en uso' }
    }
    console.error('Error creating user in auth:', authError)
    return { user: null, error: `Error al crear el usuario: ${authError.message || 'Error desconocido'}` }
  }

  if (!authData.user) {
    return { user: null, error: 'No se pudo crear el usuario en el sistema de autenticación' }
  }

  // Crear perfil
  const userProfile = await createUserProfile(
    authData.user.id,
    email.toLowerCase().trim(),
    role,
    companyId,
    fullName,
    avatarUrl
  )

  if (!userProfile) {
    // Si falla la creación del perfil, intentar eliminar el usuario de auth
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { user: null, error: 'Error al crear el perfil del usuario' }
  }

  return { user: userProfile }
}

/**
 * Actualiza un usuario
 * Solo para super_admin
 */
export async function updateUser(
  userId: string,
  updates: {
    email?: string
    fullName?: string
    role?: UserRole
    companyId?: string
    isActive?: boolean
    avatarUrl?: string | null
  }
): Promise<UserProfile | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return null
  }

  // Si se actualiza el rol o la empresa, validar
  if (updates.role === 'super_admin' || updates.companyId) {
    const companyId = updates.companyId || (await getUserProfileById(userId))?.company_id

    if (companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('is_parent')
        .eq('id', companyId)
        .single()

      // Verificar si el usuario actual es de la empresa matriz
      const { data: currentUserCompany } = await supabase
        .from('companies')
        .select('id, is_parent')
        .eq('id', profile.company_id)
        .single()

      const isCurrentUserFromParentCompany = currentUserCompany?.is_parent === true

      if (updates.role === 'super_admin' && company && !company.is_parent) {
        if (!isCurrentUserFromParentCompany) {
          console.error('Solo el super administrador de la empresa matriz puede asignar super administradores a empresas hijas')
          return null
        }
        // Si el usuario actual es de la empresa matriz, permitir asignar super_admin a empresa hija
      }
    }
  }

  // Actualizar email en auth.users si es necesario
  if (updates.email) {
    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      email: updates.email,
    })

    if (authError) {
      console.error('Error updating user email in auth:', authError)
      return null
    }
  }

  // Actualizar perfil
  const updateData: {
    email?: string
    full_name?: string | null
    role?: UserRole
    company_id?: string
    is_active?: boolean
    avatar_url?: string | null
  } = {}

  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.fullName !== undefined) updateData.full_name = updates.fullName || null
  if (updates.role !== undefined) updateData.role = updates.role
  if (updates.companyId !== undefined) updateData.company_id = updates.companyId
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl

  // Verificar que hay datos para actualizar
  if (Object.keys(updateData).length === 0) {
    console.warn('No hay datos para actualizar en el perfil del usuario')
    // Si no hay datos para actualizar, solo devolver el perfil actual
    return await getUserProfileById(userId)
  }

  console.log('Actualizando perfil de usuario:', { userId, updateData })

  // Actualizar perfil
  // Nota: Separamos la actualización de la lectura para evitar problemas con RLS
  const { data: updateResult, error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select('id')

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    return null
  }

  // Verificar que se actualizó al menos una fila
  if (!updateResult || updateResult.length === 0) {
    console.error('No se actualizó ninguna fila. El usuario puede no existir o no tener permisos.')
    return null
  }

  console.log('Perfil actualizado correctamente, obteniendo perfil completo...')

  // Esperar un momento para asegurar que la actualización se complete
  // y luego obtener el perfil actualizado usando getUserProfileById
  // que maneja correctamente las relaciones y RLS
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const updatedProfile = await getUserProfileById(userId)

  if (!updatedProfile) {
    console.error('Error: User profile was updated but could not be retrieved')
    // Intentar obtener el perfil directamente sin relaciones como fallback
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (fallbackError || !fallbackData) {
      console.error('Fallback query also failed:', fallbackError)
      return null
    }
    
    // Obtener la empresa por separado
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('id', fallbackData.company_id)
      .single()
    
    return {
      ...fallbackData,
      company: companyData || null,
    } as UserProfile
  }

  return updatedProfile
}

/**
 * Desactiva un usuario (no lo elimina, solo marca is_active = false)
 * Solo para super_admin
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return false
  }

  // No permitir desactivar a sí mismo
  if (profile.id === userId) {
    console.error('Cannot deactivate yourself')
    return false
  }

  // Desactivar usuario
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) {
    console.error('Error deactivating user:', error)
    return false
  }

  return true
}

/**
 * Reactiva un usuario (marca is_active = true)
 * Solo para super_admin
 */
export async function reactivateUser(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return false
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: true })
    .eq('id', userId)

  if (error) {
    console.error('Error reactivating user:', error)
    return false
  }

  return true
}

