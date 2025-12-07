"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { PageLoader } from "@/components/ui/page-loader"

/**
 * Componente que muestra el loader durante la navegación al dashboard
 * Se activa cuando se detecta una transición de página o carga inicial
 */
export function DashboardLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cuando cambia la ruta o se carga la página, mostrar el loader
    setIsLoading(true)

    // Función para verificar si todo está cargado
    const checkIfLoaded = () => {
      // Verificar que el DOM esté listo y que no haya elementos pendientes
      if (document.readyState === "complete") {
        // Esperar un momento para que todos los componentes se rendericen
        const timer = setTimeout(() => {
          setIsLoading(false)
        }, 600)
        return () => clearTimeout(timer)
      }
    }

    // Si la página ya está cargada
    if (document.readyState === "complete") {
      checkIfLoaded()
    } else {
      const handleLoad = () => {
        setTimeout(() => {
          setIsLoading(false)
        }, 600)
      }
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }

    // Timeout de seguridad
    const safetyTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(safetyTimer)
    }
  }, [pathname])

  return <PageLoader isLoading={isLoading} />
}

