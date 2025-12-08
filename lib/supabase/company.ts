/**
 * Funciones para gestionar empresas
 */

import { createClient } from './server'
import type { Company } from '@/lib/types/user'
import { getUserProfile } from './user'

/**
 * Obtiene todas las empresas (solo para super_admin)
 */
export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return []
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('is_parent', { ascending: false })
    .order('name')

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data as Company[]
}

/**
 * Obtiene una empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Super admin puede ver cualquier empresa
  // Otros roles solo pueden ver su propia empresa
  if (profile.role !== 'super_admin' && profile.company_id !== companyId) {
    return null
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return null
  }

  return data as Company | null
}

/**
 * Crea una nueva empresa (solo super_admin)
 */
export async function createCompany(
  name: string,
  slug: string,
  website?: string,
  logoUrl?: string,
  legalName?: string,
  address?: string,
  country?: string
): Promise<Company | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return null
  }

  // Obtener la empresa matriz para asignarla como parent
  const { data: parentCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('is_parent', true)
    .single()

  if (!parentCompany) {
    console.error('No se encontró la empresa matriz')
    return null
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name,
      slug,
      is_parent: false,
      parent_company_id: parentCompany.id,
      website: website || null,
      logo_url: logoUrl || null,
      legal_name: legalName || null,
      address: address || null,
      country: country || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating company:', error)
    return null
  }

  return data as Company
}

/**
 * Actualiza una empresa (solo super_admin)
 */
export async function updateCompany(
  companyId: string,
  updates: {
    name?: string
    slug?: string
    website?: string
    logoUrl?: string
    legalName?: string
    address?: string
    country?: string
  }
): Promise<Company | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return null
  }

  const updateData: {
    name?: string
    slug?: string
    website?: string | null
    logo_url?: string | null
    legal_name?: string | null
    address?: string | null
    country?: string | null
  } = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.slug !== undefined) updateData.slug = updates.slug
  if (updates.website !== undefined) updateData.website = updates.website || null
  if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl || null
  if (updates.legalName !== undefined) updateData.legal_name = updates.legalName || null
  if (updates.address !== undefined) updateData.address = updates.address || null
  if (updates.country !== undefined) updateData.country = updates.country || null

  const { data, error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating company:', error)
    return null
  }

  return data as Company
}

/**
 * Elimina una empresa (solo super_admin)
 * Nota: No se puede eliminar la empresa matriz
 */
export async function deleteCompany(companyId: string): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return false
  }

  // Verificar que no sea la empresa matriz
  const company = await getCompanyById(companyId)
  if (!company || company.is_parent) {
    return false
  }

  // Verificar que no tenga usuarios asociados
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)

  if (users && users.length > 0) {
    return false
  }

  const { error } = await supabase.from('companies').delete().eq('id', companyId)

  if (error) {
    console.error('Error deleting company:', error)
    return false
  }

  return true
}

/**
 * Verifica si un slug está disponible
 */
export async function isSlugAvailable(slug: string, excludeCompanyId?: string): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'super_admin') {
    return false
  }

  let query = supabase.from('companies').select('id').eq('slug', slug)

  if (excludeCompanyId) {
    query = query.neq('id', excludeCompanyId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking slug availability:', error)
    return false
  }

  return !data || data.length === 0
}

