"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

interface DashboardContentWrapperProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

/**
 * Componente wrapper que maneja las transiciones suaves entre módulos
 * - Fade out cuando se cambia de módulo
 * - Muestra skeleton durante la transición
 * - Fade in cuando se carga el nuevo módulo
 */
export function DashboardContentWrapper({
  children,
  fallback,
}: DashboardContentWrapperProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [displayChildren, setDisplayChildren] = useState(children)
  const previousPathname = useRef(pathname)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Si el pathname cambió, iniciar transición
    if (previousPathname.current !== pathname) {
      // Fade out: ocultar contenido actual
      setIsTransitioning(true)
      setShowContent(false)

      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Después del fade out, mostrar skeleton y actualizar contenido
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children)
        // Pequeño delay antes del fade in para mostrar el skeleton
        setTimeout(() => {
          setShowContent(true)
          setIsTransitioning(false)
        }, 100)
      }, 200) // Duración del fade out

      previousPathname.current = pathname
    } else {
      // Si es la primera carga, mostrar directamente
      setDisplayChildren(children)
      setShowContent(true)
      setIsTransitioning(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, children])

  return (
    <div className="relative w-full">
      {/* Skeleton durante la transición */}
      {isTransitioning && (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-200">
          {fallback}
        </div>
      )}

      {/* Contenido principal con fade in/out */}
      <div
        className={`w-full transition-opacity duration-300 ease-in-out ${
          showContent ? "opacity-100" : "opacity-0"
        } ${isTransitioning && !showContent ? "pointer-events-none" : ""}`}
      >
        {displayChildren}
      </div>
    </div>
  )
}

