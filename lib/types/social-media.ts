/**
 * Tipos relacionados con redes sociales de empresas
 */

export type SocialMediaType =
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'pinterest'
  | 'snapchat'
  | 'threads'

export interface CompanySocialMedia {
  id: string
  company_id: string
  type: SocialMediaType
  url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SocialMediaConfig {
  type: SocialMediaType
  label: string
  icon: string // Mantenemos string para compatibilidad, pero ahora será el nombre del componente
  placeholder: string
  urlPattern: RegExp
  baseUrl: string
}

/**
 * Configuración de cada red social con su información de presentación
 */
export const SOCIAL_MEDIA_CONFIGS: Record<SocialMediaType, SocialMediaConfig> = {
  facebook: {
    type: 'facebook',
    label: 'Facebook',
    icon: 'facebook',
    placeholder: 'https://www.facebook.com/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i,
    baseUrl: 'https://www.facebook.com',
  },
  instagram: {
    type: 'instagram',
    label: 'Instagram',
    icon: 'instagram',
    placeholder: 'https://www.instagram.com/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    baseUrl: 'https://www.instagram.com',
  },
  twitter: {
    type: 'twitter',
    label: 'Twitter / X',
    icon: 'twitter',
    placeholder: 'https://twitter.com/tu-empresa o https://x.com/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/i,
    baseUrl: 'https://twitter.com',
  },
  linkedin: {
    type: 'linkedin',
    label: 'LinkedIn',
    icon: 'linkedin',
    placeholder: 'https://www.linkedin.com/company/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    baseUrl: 'https://www.linkedin.com',
  },
  youtube: {
    type: 'youtube',
    label: 'YouTube',
    icon: 'youtube',
    placeholder: 'https://www.youtube.com/@tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?(youtube|youtu\.be)\/.+/i,
    baseUrl: 'https://www.youtube.com',
  },
  tiktok: {
    type: 'tiktok',
    label: 'TikTok',
    icon: 'tiktok',
    placeholder: 'https://www.tiktok.com/@tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+/i,
    baseUrl: 'https://www.tiktok.com',
  },
  whatsapp: {
    type: 'whatsapp',
    label: 'WhatsApp Business',
    icon: 'whatsapp',
    placeholder: 'https://wa.me/1234567890 o https://api.whatsapp.com/send?phone=1234567890',
    urlPattern: /^https?:\/\/(wa\.me|api\.whatsapp\.com)\/.+/i,
    baseUrl: 'https://wa.me',
  },
  pinterest: {
    type: 'pinterest',
    label: 'Pinterest',
    icon: 'pinterest',
    placeholder: 'https://www.pinterest.com/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?pinterest\.com\/.+/i,
    baseUrl: 'https://www.pinterest.com',
  },
  snapchat: {
    type: 'snapchat',
    label: 'Snapchat',
    icon: 'snapchat',
    placeholder: 'https://www.snapchat.com/add/tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?snapchat\.com\/.+/i,
    baseUrl: 'https://www.snapchat.com',
  },
  threads: {
    type: 'threads',
    label: 'Threads',
    icon: 'threads',
    placeholder: 'https://www.threads.net/@tu-empresa',
    urlPattern: /^https?:\/\/(www\.)?threads\.net\/@.+/i,
    baseUrl: 'https://www.threads.net',
  },
}

/**
 * Obtiene la configuración de una red social por su tipo
 */
export function getSocialMediaConfig(type: SocialMediaType): SocialMediaConfig {
  return SOCIAL_MEDIA_CONFIGS[type]
}

/**
 * Obtiene todas las configuraciones de redes sociales en orden
 */
export function getAllSocialMediaConfigs(): SocialMediaConfig[] {
  return Object.values(SOCIAL_MEDIA_CONFIGS)
}

/**
 * Valida si una URL es válida para un tipo de red social
 */
export function validateSocialMediaUrl(url: string, type: SocialMediaType): boolean {
  const config = getSocialMediaConfig(type)
  return config.urlPattern.test(url)
}

