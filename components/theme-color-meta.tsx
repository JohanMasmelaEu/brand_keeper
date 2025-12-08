"use client"

import { useEffect } from "react"

/**
 * Componente que agrega meta tags para themeColor con soporte para dark mode
 * Solo se ejecuta en el cliente para evitar problemas de hidratación
 * Reemplaza cualquier theme-color que Next.js pueda haber agregado
 */
export function ThemeColorMeta() {
  useEffect(() => {
    // Remover todos los meta tags theme-color existentes (incluyendo los que Next.js pudo haber creado)
    const allThemeColorTags = document.querySelectorAll('meta[name="theme-color"]')
    allThemeColorTags.forEach((tag) => tag.remove())

    // Crear meta tag para light mode
    const lightMeta = document.createElement("meta")
    lightMeta.name = "theme-color"
    lightMeta.setAttribute("media", "(prefers-color-scheme: light)")
    lightMeta.content = "#ffffff"
    document.head.appendChild(lightMeta)

    // Crear meta tag para dark mode
    const darkMeta = document.createElement("meta")
    darkMeta.name = "theme-color"
    darkMeta.setAttribute("media", "(prefers-color-scheme: dark)")
    darkMeta.content = "#0a0a0a"
    document.head.appendChild(darkMeta)

    return () => {
      // Cleanup: remover meta tags al desmontar
      if (lightMeta.parentNode) {
        lightMeta.parentNode.removeChild(lightMeta)
      }
      if (darkMeta.parentNode) {
        darkMeta.parentNode.removeChild(darkMeta)
      }
    }
  }, [])

  return null
}

