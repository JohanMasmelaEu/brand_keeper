"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface PageLoaderProps {
  isLoading?: boolean
  fadeOutDuration?: number // Duración del fade out en milisegundos (por defecto 1500ms)
}

/**
 * Componente de loader de pantalla completa
 * Muestra un logo centrado sobre fondo negro mientras se cargan los elementos
 * Incluye animación de desvanecido configurable al ocultarse
 */
export function PageLoader({ isLoading = true, fadeOutDuration = 1500 }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (!isLoading && showLoader) {
      // Iniciar animación de desvanecido
      setIsFading(true)
      
      // Después de la duración especificada, ocultar completamente el loader
      const timer = setTimeout(() => {
        setShowLoader(false)
        setIsFading(false)
      }, fadeOutDuration)
      
      return () => clearTimeout(timer)
    } else if (isLoading) {
      // Si vuelve a cargar, resetear estados
      setShowLoader(true)
      setIsFading(false)
    }
  }, [isLoading, showLoader, fadeOutDuration])

  if (!showLoader) return null

  // Calcular la duración de la animación en milisegundos para CSS
  const animationDurationMs = fadeOutDuration

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={isFading ? {
        animation: `fade-out-smooth ${animationDurationMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
      } : {
        opacity: 1
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-[400px] h-[400px]">
          <Image
            src="/images/LOGO_LOADER.gif"
            alt="Cargando..."
            fill
            sizes="400px"
            unoptimized
            className={`object-contain ${
              isFading ? '' : 'opacity-100 animate-pulse'
            }`}
            style={isFading ? {
              animation: `fade-out-smooth ${animationDurationMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
            } : {}}
            priority
          />
        </div>
      </div>
    </div>
  )
}

