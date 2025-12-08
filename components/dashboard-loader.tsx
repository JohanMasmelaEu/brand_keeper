"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { PageLoader } from "@/components/ui/page-loader"

const DASHBOARD_LOADED_KEY = "dashboard_loaded"

/**
 * Detecta si la página se recargó manualmente (F5, Ctrl+R, etc.)
 */
function isManualReload(): boolean {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return false
  }
  
  try {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigation) {
      // type === "reload" indica una recarga manual
      return navigation.type === "reload"
    }
    
    // Fallback para navegadores más antiguos
    if ("navigation" in performance) {
      const perfNav = (performance as unknown as { navigation: { type: number } }).navigation
      // type 1 = TYPE_RELOAD
      return perfNav.type === 1
    }
  } catch (e) {
    // Silently fail
  }
  
  return false
}

/**
 * Componente que muestra el loader en la primera carga del dashboard
 * y cuando se recarga manualmente la página (F5, Ctrl+R, etc.)
 * No se muestra en cambios de módulos (para eso se usa skeleton)
 */
export function DashboardLoader() {
  const pathname = usePathname()
  // Inicializar siempre como true para evitar problemas de hidratación
  // El useEffect se encargará de actualizar el estado correcto después de la hidratación
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Marcar como montado después de la hidratación
    setMounted(true)
    
    // Detectar si es una recarga manual
    const isReload = isManualReload()
    
    // Si es una recarga manual, siempre mostrar el loader y limpiar el flag
    if (isReload) {
      setIsLoading(true)
      // Limpiar el flag de carga para forzar el loader
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DASHBOARD_LOADED_KEY)
      }
    } else {
      // Verificar si ya se cargó el dashboard en esta sesión
      if (typeof window !== "undefined" && sessionStorage.getItem(DASHBOARD_LOADED_KEY)) {
        setIsLoading(false)
        return
      }
      // Si no es recarga y no hay flag, es primera carga
      setIsLoading(true)
    }

    // Función para verificar si todo está cargado
    // Aumentamos el tiempo de espera para dar tiempo al sidebar de inicializarse
    const checkIfLoaded = () => {
      // Verificar que el DOM esté listo y que no haya elementos pendientes
      if (document.readyState === "complete") {
        // Esperar un momento para que todos los componentes se rendericen
        // Incluyendo el sidebar que puede tardar ~350ms en inicializarse
        const timer = setTimeout(() => {
          setIsLoading(false)
          // Marcar que el dashboard ya se cargó
          if (typeof window !== "undefined") {
            sessionStorage.setItem(DASHBOARD_LOADED_KEY, "true")
          }
        }, 800) // Aumentado de 600ms a 800ms para cubrir la inicialización del sidebar
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
          // Marcar que el dashboard ya se cargó
          if (typeof window !== "undefined") {
            sessionStorage.setItem(DASHBOARD_LOADED_KEY, "true")
          }
        }, 800) // Aumentado de 600ms a 800ms
      }
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }

    // Timeout de seguridad
    const safetyTimer = setTimeout(() => {
      setIsLoading(false)
      // Marcar que el dashboard ya se cargó
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DASHBOARD_LOADED_KEY, "true")
      }
    }, 2000)

    return () => {
      clearTimeout(safetyTimer)
    }
  }, [])

  // No renderizar hasta que el componente esté montado (después de la hidratación)
  // Esto evita problemas de hidratación
  if (!mounted) {
    return null
  }

  // Si ya se cargó y NO es una recarga manual, no renderizar el loader
  const isReload = typeof window !== "undefined" ? isManualReload() : false
  if (!isReload && typeof window !== "undefined" && sessionStorage.getItem(DASHBOARD_LOADED_KEY)) {
    return null
  }

  return <PageLoader isLoading={isLoading} />
}

