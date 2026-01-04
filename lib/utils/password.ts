/**
 * Utilidades para generación de contraseñas
 */

/**
 * Genera una contraseña aleatoria segura
 * @param length Longitud de la contraseña (por defecto 12)
 * @returns Contraseña aleatoria
 */
export function generateRandomPassword(length: number = 12): string {
  // Caracteres permitidos: letras mayúsculas, minúsculas, números y símbolos especiales
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  // Asegurar al menos un carácter de cada tipo
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  // Añadir al menos un carácter de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Completar el resto con caracteres aleatorios
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Mezclar los caracteres para que no estén siempre en el mismo orden
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

