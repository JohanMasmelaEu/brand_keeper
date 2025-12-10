/**
 * Funciones para gestionar redes sociales de empresas
 */

import { createClient } from './server'
import type { CompanySocialMedia, SocialMediaType } from '@/lib/types/social-media'
import { getUserProfile } from './user'

/**
 * Obtiene todas las redes sociales de una empresa
 */
export async function getCompanySocialMedia(
  companyId: string
): Promise<CompanySocialMedia[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  // Verificar permisos: super_admin puede ver cualquier empresa,
  // otros roles solo pueden ver su propia empresa
  if (profile.role !== 'super_admin' && profile.company_id !== companyId) {
    return []
  }

  const { data, error } = await supabase
    .from('company_social_media')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('type')

  if (error) {
    console.error('Error fetching company social media:', error)
    return []
  }

  return (data as CompanySocialMedia[]) || []
}

/**
 * Obtiene una red social específica de una empresa
 */
export async function getCompanySocialMediaByType(
  companyId: string,
  type: SocialMediaType
): Promise<CompanySocialMedia | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Verificar permisos
  if (profile.role !== 'super_admin' && profile.company_id !== companyId) {
    return null
  }

  const { data, error } = await supabase
    .from('company_social_media')
    .select('*')
    .eq('company_id', companyId)
    .eq('type', type)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el registro
      return null
    }
    console.error('Error fetching company social media by type:', error)
    return null
  }

  return data as CompanySocialMedia
}

/**
 * Crea o actualiza una red social de una empresa
 */
export async function upsertCompanySocialMedia(
  companyId: string,
  type: SocialMediaType,
  url: string
): Promise<CompanySocialMedia | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Verificar permisos: solo super_admin y admin pueden gestionar
  if (profile.role === 'collaborator') {
    return null
  }

  // Admin solo puede gestionar redes sociales de su propia empresa
  if (profile.role === 'admin' && profile.company_id !== companyId) {
    return null
  }

  // Validar URL básica
  if (!url || !url.trim()) {
    return null
  }

  // Intentar hacer upsert
  const upsertData = {
    company_id: companyId,
    type,
    url: url.trim(),
    is_active: true,
  }

  const { data, error } = await supabase
    .from('company_social_media')
    .upsert(
      upsertData,
      {
        onConflict: 'company_id,type',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting company social media:', error)
    return null
  }

  return data as CompanySocialMedia
}

/**
 * Elimina una red social de una empresa (marca como inactiva)
 */
export async function deleteCompanySocialMedia(
  companyId: string,
  type: SocialMediaType
): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return false
  }

  // Verificar permisos: solo super_admin y admin pueden gestionar
  if (profile.role === 'collaborator') {
    return false
  }

  // Admin solo puede gestionar redes sociales de su propia empresa
  if (profile.role === 'admin' && profile.company_id !== companyId) {
    return false
  }

  const { error } = await supabase
    .from('company_social_media')
    .update({ is_active: false })
    .eq('company_id', companyId)
    .eq('type', type)

  if (error) {
    console.error('Error deleting company social media:', error)
    return false
  }

  return true
}

/**
 * Elimina físicamente una red social de una empresa
 */
export async function hardDeleteCompanySocialMedia(
  companyId: string,
  type: SocialMediaType
): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return false
  }

  // Solo super_admin puede eliminar físicamente
  if (profile.role !== 'super_admin') {
    return false
  }

  const { error } = await supabase
    .from('company_social_media')
    .delete()
    .eq('company_id', companyId)
    .eq('type', type)

  if (error) {
    console.error('Error hard deleting company social media:', error)
    return false
  }

  return true
}

/**
 * Actualiza múltiples redes sociales de una empresa
 * Elimina las redes sociales que no están en el array y crea/actualiza las que sí están
 */
export async function updateCompanySocialMedia(
  companyId: string,
  socialMedia: Array<{ type: SocialMediaType; url: string }>
): Promise<CompanySocialMedia[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  // Verificar permisos
  if (profile.role === 'collaborator') {
    return []
  }

  if (profile.role === 'admin' && profile.company_id !== companyId) {
    return []
  }

  // Obtener todas las redes sociales existentes
  const existingSocialMedia = await getCompanySocialMedia(companyId)
  const existingTypes = new Set(existingSocialMedia.map((sm) => sm.type))
  const newTypes = new Set(socialMedia.filter((sm) => sm.url && sm.url.trim()).map((sm) => sm.type))

  // Eliminar las redes sociales que ya no están en el nuevo array
  for (const existing of existingSocialMedia) {
    if (!newTypes.has(existing.type)) {
      await deleteCompanySocialMedia(companyId, existing.type)
    }
  }

  const results: CompanySocialMedia[] = []

  // Procesar cada red social del nuevo array
  for (const sm of socialMedia) {
    if (sm.url && sm.url.trim()) {
      const result = await upsertCompanySocialMedia(companyId, sm.type, sm.url)
      if (result) {
        results.push(result)
      }
    }
  }

  return results
}

