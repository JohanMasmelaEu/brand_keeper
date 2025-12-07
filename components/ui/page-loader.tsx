"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface PageLoaderProps {
  isLoading?: boolean
}

/**
 * Componente de loader de pantalla completa
 * Muestra un logo centrado sobre fondo blanco mientras se cargan los elementos
 * Incluye animación de desvanecido de 1.5 segundos al ocultarse
 */
export function PageLoader({ isLoading = true }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (!isLoading && showLoader) {
      // Iniciar animación de desvanecido
      setIsFading(true)
      
      // Después de 1.5 segundos, ocultar completamente el loader
      const timer = setTimeout(() => {
        setShowLoader(false)
        setIsFading(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else if (isLoading) {
      // Si vuelve a cargar, resetear estados
      setShowLoader(true)
      setIsFading(false)
    }
  }, [isLoading, showLoader])

  if (!showLoader) return null

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white ${
        isFading ? 'fade-out-smooth' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/images/LOGO_LOADER.png"
          alt="Cargando..."
          width={200}
          height={200}
          className={`${
            isFading ? 'fade-out-smooth' : 'opacity-100 animate-pulse'
          }`}
          priority
        />
      </div>
    </div>
  )
}

