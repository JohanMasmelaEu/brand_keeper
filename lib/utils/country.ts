/**
 * Utilidades para trabajar con países
 */

/**
 * Convierte un código de país ISO 3166-1 alpha-2 a emoji de bandera
 * @param code Código de país de 2 letras (ej: "ES", "CO")
 * @returns Emoji de bandera o string vacío si el código no es válido
 */
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) {
    return ""
  }

  const codeUpper = code.toUpperCase()
  // Convertir letras a regional indicator symbols (A = 0x1F1E6, etc.)
  const base = 0x1f1e6 // Regional Indicator Symbol Letter A
  const codePoint1 = base + (codeUpper.charCodeAt(0) - 65)
  const codePoint2 = base + (codeUpper.charCodeAt(1) - 65)

  // Verificar que los códigos sean válidos
  if (
    codePoint1 < base ||
    codePoint1 > base + 25 ||
    codePoint2 < base ||
    codePoint2 > base + 25
  ) {
    return ""
  }

  return String.fromCodePoint(codePoint1, codePoint2)
}

/**
 * Normaliza un string para búsqueda (elimina acentos, convierte a minúsculas)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .trim()
}

/**
 * Obtiene el emoji de bandera desde el nombre del país
 * Busca dinámicamente en una lista de países y devuelve el emoji correspondiente
 * La búsqueda es flexible y maneja variaciones en el nombre (mayúsculas, acentos, espacios)
 * @param countryName Nombre del país (puede tener variaciones)
 * @param countries Lista de países con sus códigos (cargada dinámicamente desde la BD)
 * @returns Emoji de bandera o string vacío si no se encuentra
 */
export function getCountryFlagByName(
  countryName: string,
  countries: Array<{ name: string; code: string }>
): string {
  if (!countryName || !countries || countries.length === 0) {
    return ""
  }

  // Normalizar el nombre del país para búsqueda
  const normalizedSearch = normalizeString(countryName)

  // Buscar coincidencia exacta primero
  let country = countries.find(
    (c) => normalizeString(c.name) === normalizedSearch
  )

  // Si no hay coincidencia exacta, buscar coincidencia parcial
  if (!country) {
    country = countries.find((c) =>
      normalizeString(c.name).includes(normalizedSearch) ||
      normalizedSearch.includes(normalizeString(c.name))
    )
  }

  if (!country || !country.code) {
    return ""
  }

  return getCountryFlag(country.code)
}

