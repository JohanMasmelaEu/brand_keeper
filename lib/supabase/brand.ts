/**
 * Funciones para gestionar configuraciones de marca
 */

import { createClient } from './server'
import type { BrandSettings, CreateBrandSettingsInput, UpdateBrandSettingsInput } from '@/lib/types/brand'
import { getUserProfile } from './user'

/**
 * Obtiene todas las configuraciones de marca según permisos
 */
export async function getAllBrandSettings(): Promise<BrandSettings[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  let query = supabase.from('brand_settings').select('*')

  // Super admin ve todas las configuraciones
  // Admin ve solo las de su empresa (no globales)
  // Colaborador ve las de su empresa y las globales
  if (profile.role === 'admin') {
    query = query.eq('company_id', profile.company_id).eq('is_global', false)
  } else if (profile.role === 'collaborator') {
    query = query.or(`company_id.eq.${profile.company_id},is_global.eq.true`)
  }
  // Super admin no necesita filtros adicionales

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching brand settings:', error)
    return []
  }

  return (data as BrandSettings[]) || []
}

/**
 * Obtiene una configuración de marca por ID
 */
export async function getBrandSettingsById(id: string): Promise<BrandSettings | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  const { data, error } = await supabase
    .from('brand_settings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching brand settings:', error)
    return null
  }

  if (!data) {
    return null
  }

  const brandSettings = data as BrandSettings

  // Validar permisos
  if (profile.role === 'super_admin') {
    return brandSettings
  }

  if (profile.role === 'admin') {
    // Admin solo puede ver configuraciones de su empresa (no globales)
    if (brandSettings.company_id === profile.company_id && !brandSettings.is_global) {
      return brandSettings
    }
    return null
  }

  if (profile.role === 'collaborator') {
    // Colaborador puede ver configuraciones de su empresa y globales
    if (brandSettings.company_id === profile.company_id || brandSettings.is_global) {
      return brandSettings
    }
    return null
  }

  return null
}

/**
 * Obtiene la configuración de marca de una empresa específica
 */
export async function getBrandSettingsByCompanyId(
  companyId: string,
  includeGlobal: boolean = true
): Promise<BrandSettings | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Validar permisos
  if (profile.role !== 'super_admin' && profile.company_id !== companyId) {
    return null
  }

  // Primero intentar obtener la configuración específica de la empresa
  const { data: companySettings, error: companyError } = await supabase
    .from('brand_settings')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_global', false)
    .single()

  if (!companyError && companySettings) {
    return companySettings as BrandSettings
  }

  // Si no hay configuración específica y se permite incluir globales, buscar la global
  if (includeGlobal) {
    // Buscar configuración global de la empresa matriz
    const { data: parentCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('is_parent', true)
      .single()

    if (parentCompany) {
      const { data: globalSettings, error: globalError } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('company_id', parentCompany.id)
        .eq('is_global', true)
        .single()

      if (!globalError && globalSettings) {
        return globalSettings as BrandSettings
      }
    }
  }

  return null
}

/**
 * Crea una nueva configuración de marca
 */
export async function createBrandSettings(
  input: CreateBrandSettingsInput
): Promise<BrandSettings | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Validar permisos
  if (profile.role === 'super_admin') {
    // Super admin puede crear para cualquier empresa
  } else if (profile.role === 'admin') {
    // Admin solo puede crear para su empresa (no globales)
    if (profile.company_id !== input.company_id || input.is_global) {
      return null
    }
  } else {
    // Colaborador no puede crear configuraciones
    return null
  }

  // Validar que solo empresa matriz puede crear configuraciones globales
  if (input.is_global) {
    const { data: company } = await supabase
      .from('companies')
      .select('is_parent')
      .eq('id', input.company_id)
      .single()

    if (!company || !company.is_parent) {
      return null
    }
  }

  const { data, error } = await supabase
    .from('brand_settings')
    .insert({
      company_id: input.company_id,
      primary_color: input.primary_color,
      secondary_color: input.secondary_color || null,
      tertiary_color: input.tertiary_color || null,
      negative_color: input.negative_color || null,
      font_family: input.font_family,
      secondary_font: input.secondary_font || null,
      contrast_font: input.contrast_font || null,
      logo_url: input.logo_url || null,
      is_global: input.is_global || false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating brand settings:', error)
    return null
  }

  return data as BrandSettings
}

/**
 * Actualiza una configuración de marca existente
 */
export async function updateBrandSettings(
  id: string,
  input: UpdateBrandSettingsInput
): Promise<BrandSettings | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  // Obtener la configuración actual
  const currentSettings = await getBrandSettingsById(id)
  if (!currentSettings) {
    return null
  }

  // Validar permisos
  if (profile.role === 'super_admin') {
    // Super admin puede actualizar cualquier configuración
  } else if (profile.role === 'admin') {
    // Admin solo puede actualizar configuraciones de su empresa (no globales)
    if (currentSettings.company_id !== profile.company_id || currentSettings.is_global) {
      return null
    }
  } else {
    // Colaborador no puede actualizar configuraciones
    return null
  }

  const updateData: {
    primary_color?: string
    secondary_color?: string | null
    tertiary_color?: string | null
    negative_color?: string | null
    font_family?: string
    secondary_font?: string | null
    contrast_font?: string | null
    logo_url?: string | null
    logo_variants?: Record<string, unknown>
  } = {}

  if (input.primary_color !== undefined) updateData.primary_color = input.primary_color
  if (input.secondary_color !== undefined) updateData.secondary_color = input.secondary_color || null
  if (input.tertiary_color !== undefined) updateData.tertiary_color = input.tertiary_color || null
  if (input.negative_color !== undefined) updateData.negative_color = input.negative_color || null
  if (input.font_family !== undefined) updateData.font_family = input.font_family
  if (input.secondary_font !== undefined) updateData.secondary_font = input.secondary_font || null
  if (input.contrast_font !== undefined) updateData.contrast_font = input.contrast_font || null
  if (input.logo_url !== undefined) updateData.logo_url = input.logo_url || null
  if (input.logo_variants !== undefined) updateData.logo_variants = input.logo_variants as Record<string, unknown>

  const { data, error } = await supabase
    .from('brand_settings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating brand settings:', error)
    return null
  }

  return data as BrandSettings
}

/**
 * Elimina una configuración de marca
 */
export async function deleteBrandSettings(id: string): Promise<boolean> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return false
  }

  // Obtener la configuración actual
  const currentSettings = await getBrandSettingsById(id)
  if (!currentSettings) {
    return false
  }

  // Validar permisos
  if (profile.role === 'super_admin') {
    // Super admin puede eliminar cualquier configuración
  } else if (profile.role === 'admin') {
    // Admin solo puede eliminar configuraciones de su empresa (no globales)
    if (currentSettings.company_id !== profile.company_id || currentSettings.is_global) {
      return false
    }
  } else {
    // Colaborador no puede eliminar configuraciones
    return false
  }

  const { error } = await supabase.from('brand_settings').delete().eq('id', id)

  if (error) {
    console.error('Error deleting brand settings:', error)
    return false
  }

  return true
}

