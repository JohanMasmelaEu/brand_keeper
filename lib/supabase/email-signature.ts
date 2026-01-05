/**
 * Funciones para gestionar plantillas de firma de correo
 */

import { createClient } from './server'
import type { 
  EmailSignatureTemplate, 
  CreateEmailSignatureTemplateInput,
  UpdateEmailSignatureTemplateInput 
} from '@/lib/types/email-signature'
import { getUserProfile } from './user'

/**
 * Obtiene todas las plantillas disponibles para el usuario actual
 * - Super Admin: ve todas las plantillas
 * - Admin: ve plantillas de su empresa + globales
 * - Colaborador: ve solo plantillas activas de su empresa + globales
 */
export async function getEmailSignatureTemplates(
  includeInactive = false
): Promise<EmailSignatureTemplate[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  let query = supabase
    .from('email_signature_templates')
    .select(`
      *,
      company:companies!email_signature_templates_company_id_fkey (
        id,
        name,
        logo_url,
        website
      )
    `)
    .order('is_global', { ascending: false })
    .order('name')

  // Colaborador solo ve activas
  if (profile.role === 'collaborator' || !includeInactive) {
    query = query.eq('is_active', true)
  }

  // Admin solo ve de su empresa + globales
  if (profile.role === 'admin') {
    query = query.or(`company_id.eq.${profile.company_id},is_global.eq.true`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching email signature templates:', error)
    return []
  }

  return data as EmailSignatureTemplate[]
}

/**
 * Obtiene una plantilla por ID
 */
export async function getEmailSignatureTemplateById(
  templateId: string
): Promise<EmailSignatureTemplate | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  const { data, error } = await supabase
    .from('email_signature_templates')
    .select(`
      *,
      company:companies!email_signature_templates_company_id_fkey (
        id,
        name,
        logo_url,
        website
      )
    `)
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching email signature template:', error)
    return null
  }

  if (!data) {
    return null
  }

  // Validar permisos
  if (profile.role === 'collaborator') {
    // Colaborador solo puede ver activas de su empresa o globales
    if (!data.is_active || (data.company_id !== profile.company_id && !data.is_global)) {
      return null
    }
  } else if (profile.role === 'admin') {
    // Admin solo puede ver de su empresa o globales
    if (data.company_id !== profile.company_id && !data.is_global) {
      return null
    }
  }
  // Super Admin puede ver todas

  return data as EmailSignatureTemplate
}

/**
 * Obtiene plantillas activas disponibles para un colaborador
 * (solo de su empresa + globales)
 */
export async function getAvailableTemplatesForUser(): Promise<EmailSignatureTemplate[]> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    return []
  }

  const { data, error } = await supabase
    .from('email_signature_templates')
    .select(`
      *,
      company:companies!email_signature_templates_company_id_fkey (
        id,
        name,
        logo_url,
        website
      )
    `)
    .eq('is_active', true)
    .or(`company_id.eq.${profile.company_id},is_global.eq.true`)
    .order('is_global', { ascending: false })
    .order('name')

  if (error) {
    console.error('Error fetching available templates:', error)
    return []
  }

  return data as EmailSignatureTemplate[]
}

/**
 * Crea una nueva plantilla de firma
 */
export async function createEmailSignatureTemplate(
  input: CreateEmailSignatureTemplateInput
): Promise<EmailSignatureTemplate | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    throw new Error('No autenticado')
  }

  // Validar permisos
  if (profile.role !== 'super_admin' && profile.role !== 'admin') {
    throw new Error('No tienes permisos para crear plantillas')
  }

  // Admin solo puede crear en su empresa
  if (profile.role === 'admin' && input.company_id !== profile.company_id) {
    throw new Error('Solo puedes crear plantillas para tu empresa')
  }

  // Validar que solo la matriz puede crear globales
  if (input.is_global) {
    const { data: company } = await supabase
      .from('companies')
      .select('is_parent')
      .eq('id', input.company_id)
      .single()

    if (!company?.is_parent) {
      throw new Error('Solo la empresa matriz puede crear plantillas globales')
    }
  }

  const { data, error } = await supabase
    .from('email_signature_templates')
    .insert({
      company_id: input.company_id,
      name: input.name,
      description: input.description || null,
      template_type: input.template_type,
      html_content: input.html_content,
      google_font: input.google_font || null,
      is_global: input.is_global ?? false,
      is_active: input.is_active ?? true,
    })
    .select(`
      *,
      company:companies!email_signature_templates_company_id_fkey (
        id,
        name,
        logo_url,
        website
      )
    `)
    .single()

  if (error) {
    console.error('Error creating email signature template:', error)
    throw new Error(error.message || 'Error al crear la plantilla')
  }

  return data as EmailSignatureTemplate
}

/**
 * Actualiza una plantilla de firma
 */
export async function updateEmailSignatureTemplate(
  templateId: string,
  input: UpdateEmailSignatureTemplateInput
): Promise<EmailSignatureTemplate | null> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    throw new Error('No autenticado')
  }

  // Validar permisos
  if (profile.role !== 'super_admin' && profile.role !== 'admin') {
    throw new Error('No tienes permisos para actualizar plantillas')
  }

  // Obtener plantilla actual para validar permisos
  const currentTemplate = await getEmailSignatureTemplateById(templateId)
  if (!currentTemplate) {
    throw new Error('Plantilla no encontrada')
  }

  // Admin solo puede actualizar plantillas de su empresa (no globales)
  if (profile.role === 'admin') {
    if (currentTemplate.company_id !== profile.company_id || currentTemplate.is_global) {
      throw new Error('No tienes permisos para actualizar esta plantilla')
    }
  }

  // Validar que solo la matriz puede hacer plantillas globales
  if (input.is_global !== undefined && input.is_global) {
    const { data: company } = await supabase
      .from('companies')
      .select('is_parent')
      .eq('id', currentTemplate.company_id)
      .single()

    if (!company?.is_parent) {
      throw new Error('Solo la empresa matriz puede crear plantillas globales')
    }
  }

  const updateData: Record<string, unknown> = {}
  
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.template_type !== undefined) updateData.template_type = input.template_type
  if (input.html_content !== undefined) updateData.html_content = input.html_content
  if (input.google_font !== undefined) updateData.google_font = input.google_font || null
  if (input.is_global !== undefined) updateData.is_global = input.is_global
  if (input.is_active !== undefined) updateData.is_active = input.is_active

  const { data, error } = await supabase
    .from('email_signature_templates')
    .update(updateData)
    .eq('id', templateId)
    .select(`
      *,
      company:companies!email_signature_templates_company_id_fkey (
        id,
        name,
        logo_url,
        website
      )
    `)
    .single()

  if (error) {
    console.error('Error updating email signature template:', error)
    throw new Error(error.message || 'Error al actualizar la plantilla')
  }

  return data as EmailSignatureTemplate
}

/**
 * Elimina una plantilla de firma
 */
export async function deleteEmailSignatureTemplate(
  templateId: string
): Promise<void> {
  const supabase = await createClient()
  const profile = await getUserProfile()

  if (!profile) {
    throw new Error('No autenticado')
  }

  // Validar permisos
  if (profile.role !== 'super_admin' && profile.role !== 'admin') {
    throw new Error('No tienes permisos para eliminar plantillas')
  }

  // Obtener plantilla actual para validar permisos
  const currentTemplate = await getEmailSignatureTemplateById(templateId)
  if (!currentTemplate) {
    throw new Error('Plantilla no encontrada')
  }

  // Admin solo puede eliminar plantillas de su empresa (no globales)
  if (profile.role === 'admin') {
    if (currentTemplate.company_id !== profile.company_id || currentTemplate.is_global) {
      throw new Error('No tienes permisos para eliminar esta plantilla')
    }
  }

  const { error } = await supabase
    .from('email_signature_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('Error deleting email signature template:', error)
    throw new Error(error.message || 'Error al eliminar la plantilla')
  }
}

