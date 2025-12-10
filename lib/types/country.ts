/**
 * Tipos relacionados con países
 */

export interface Country {
  id: string
  name: string
  code: string
  region: string | null
  created_at: string
  updated_at: string
}

