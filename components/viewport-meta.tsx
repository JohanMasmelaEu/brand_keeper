"use client"

import { useEffect } from "react"

/**
 * Componente que agrega meta tags de viewport adicionales client-side
 * para evitar problemas de hidratación con Next.js 15.5.7
 */
export function ViewportMeta() {
  useEffect(() => {
    // Agregar meta tag para maximum-scale y user-scalable si no existe
    const existingViewport = document.querySelector('meta[name="viewport"]')
    
    if (existingViewport) {
      // Si ya existe, actualizar su contenido para incluir nuestras propiedades
      const currentContent = existingViewport.getAttribute('content') || ''
      if (!currentContent.includes('maximum-scale=5')) {
        const newContent = currentContent 
          ? `${currentContent}, maximum-scale=5, user-scalable=yes`
          : 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
        existingViewport.setAttribute('content', newContent)
      }
    } else {
      // Si no existe, crear uno nuevo (aunque Next.js debería haberlo creado)
      const viewportMeta = document.createElement("meta")
      viewportMeta.name = "viewport"
      viewportMeta.content = "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
      document.head.appendChild(viewportMeta)
    }
  }, [])

  return null
}

