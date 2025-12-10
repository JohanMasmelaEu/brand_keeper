/**
 * Funciones para gestionar países
 */

import { createClient } from './server'
import type { Country } from '@/lib/types/country'

/**
 * Obtiene todos los países disponibles
 */
export async function getCountries(): Promise<Country[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('region', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching countries:', error)
    return []
  }

  return (data as Country[]) || []
}

