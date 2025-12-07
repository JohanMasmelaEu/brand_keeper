/**
 * Funciones para gestionar usuarios y perfiles
 */

import { createClient } from './server'
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
  fullName?: string
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

