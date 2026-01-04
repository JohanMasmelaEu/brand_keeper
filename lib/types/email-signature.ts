/**
 * Tipos relacionados con plantillas de firma de correo
 */

export type EmailSignatureTemplateType = 'simple' | 'with_photo' | 'vertical'

export interface EmailSignatureTemplate {
  id: string
  company_id: string
  name: string
  description: string | null
  template_type: EmailSignatureTemplateType
  html_content: string
  is_global: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  // Relación expandida (opcional)
  company?: {
    id: string
    name: string
    logo_url: string | null
    website: string | null
  }
}

export interface CreateEmailSignatureTemplateInput {
  company_id: string
  name: string
  description?: string | null
  template_type: EmailSignatureTemplateType
  html_content: string
  is_global?: boolean
  is_active?: boolean
}

export interface UpdateEmailSignatureTemplateInput {
  name?: string
  description?: string | null
  template_type?: EmailSignatureTemplateType
  html_content?: string
  is_global?: boolean
  is_active?: boolean
}

/**
 * Datos del formulario para generar una firma personalizada
 */
export interface EmailSignatureFormData {
  template_id: string
  full_name: string
  position: string
  phone: string
  phone_extension?: string
  email: string
  website?: string
  photo_url?: string
}

/**
 * Datos de la empresa para aplicar en la firma
 */
export interface CompanyBrandData {
  name: string
  logo_url: string | null
  website: string | null
  primary_color?: string
  secondary_color?: string
  font_family?: string
}

