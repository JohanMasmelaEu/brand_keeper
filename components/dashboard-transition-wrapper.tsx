"use client"

import { useEffect, useState, useRef, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { PageSkeleton, TableSkeleton, FormSkeleton } from "@/components/page-skeleton"

interface DashboardTransitionWrapperProps {
  children: ReactNode
}

/**
 * Componente wrapper que detecta el tipo de página y muestra el skeleton apropiado
 * Maneja las transiciones suaves entre módulos con fade out/in
 */
export function DashboardTransitionWrapper({
  children,
}: DashboardTransitionWrapperProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [displayChildren, setDisplayChildren] = useState(children)
  const previousPathname = useRef(pathname)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const skeletonTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Determinar qué skeleton mostrar según la ruta
  const getSkeleton = () => {
    if (pathname.includes("/companies/new") || (pathname.includes("/companies/") && pathname.includes("/edit"))) {
      return <FormSkeleton />
    }
    if (pathname.includes("/companies")) {
      return <TableSkeleton />
    }
    return <PageSkeleton />
  }

  useEffect(() => {
    // Si el pathname cambió, iniciar transición
    if (previousPathname.current !== pathname) {
      // Fade out: ocultar contenido actual
      setIsTransitioning(true)
      setShowContent(false)

      // Limpiar timeouts anteriores si existen
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current)
      }

      // Después del fade out (300ms), actualizar contenido
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children)
        // Pequeño delay antes del fade in para mostrar el skeleton
        skeletonTimeoutRef.current = setTimeout(() => {
          setShowContent(true)
          // Esperar un poco más antes de ocultar el skeleton para que se vea la transición
          setTimeout(() => {
            setIsTransitioning(false)
          }, 200)
        }, 150)
      }, 300) // Duración del fade out

      previousPathname.current = pathname
    } else {
      // Si es la primera carga o mismo pathname, actualizar children sin transición
      setDisplayChildren(children)
      setShowContent(true)
      setIsTransitioning(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current)
      }
    }
  }, [pathname, children])

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col">
      {/* Skeleton durante la transición */}
      {isTransitioning && (
        <div className="absolute inset-0 z-10 animate-in-module">
          {getSkeleton()}
        </div>
      )}

      {/* Contenido principal con fade in/out */}
      <div
        className={`w-full h-full flex-1 min-h-0 flex flex-col ${
          showContent 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-1"
        } ${isTransitioning && !showContent ? "pointer-events-none" : ""}`}
        style={{
          transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {displayChildren}
      </div>
    </div>
  )
}

