/**
 * Tipos TypeScript para el módulo de configuración de marca
 */

export interface LogoVariants {
  principal?: string | null
  imagotipo?: string | null
  isotipo?: string | null
  negativo?: string | null
  contraido?: string | null
}

export interface BrandSettings {
  id: string
  company_id: string
  primary_color: string
  secondary_color: string | null
  tertiary_color: string | null
  negative_color: string | null
  font_family: string
  secondary_font: string | null
  contrast_font: string | null
  logo_url: string | null
  logo_variants: LogoVariants | Record<string, unknown>
  is_global: boolean
  created_at: string
  updated_at: string
}

export interface CreateBrandSettingsInput {
  company_id: string
  primary_color: string
  secondary_color?: string | null
  tertiary_color?: string | null
  negative_color?: string | null
  font_family: string
  secondary_font?: string | null
  contrast_font?: string | null
  logo_url?: string | null
  is_global?: boolean
}

export interface UpdateBrandSettingsInput {
  primary_color?: string
  secondary_color?: string | null
  tertiary_color?: string | null
  negative_color?: string | null
  font_family?: string
  secondary_font?: string | null
  contrast_font?: string | null
  logo_url?: string | null
  logo_variants?: LogoVariants | Record<string, unknown>
}

