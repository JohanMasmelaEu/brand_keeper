/**
 * Tipos relacionados con usuarios y perfiles
 */

export type UserRole = 'super_admin' | 'admin' | 'collaborator'

export interface Company {
  id: string
  name: string
  slug: string
  is_parent: boolean
  parent_company_id: string | null
  website: string | null
  logo_url: string | null
  legal_name: string | null
  address: string | null
  country: string | null
  created_at: string
  updated_at: string
  // Relación expandida (opcional)
  social_media?: import('./social-media').CompanySocialMedia[]
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  company_id: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relación expandida (opcional)
  company?: Company
}

export interface UserWithProfile {
  id: string
  email: string
  profile: UserProfile | null
}

