"use client"

/**
 * Componente que detecta cuando el servidor de desarrollo se reinicia
 * y recarga automáticamente el navegador
 * Solo funciona en modo desarrollo
 * 
 * NOTA: Next.js ya tiene hot reload nativo, este componente solo maneja
 * casos donde el servidor se reinicia completamente (como con nodemon)
 */
import { useEffect, useRef } from "react"

export function DevReload() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isReloadingRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    // Solo activar en desarrollo
    if (process.env.NODE_ENV !== "development") {
      return
    }

    const connectWebSocket = () => {
      // Si ya estamos recargando, no intentar reconectar
      if (isReloadingRef.current) {
        return
      }

      // Limitar intentos de reconexión para evitar loops infinitos
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn("⚠️ Máximo de intentos de reconexión alcanzado. Recargando página...")
        if (!isReloadingRef.current) {
          isReloadingRef.current = true
          window.location.reload()
        }
        return
      }

      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const host = window.location.host
        const wsUrl = `${protocol}//${host}/_next/webpack-hmr`
        
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          // WebSocket conectado exitosamente - resetear contador de intentos
          reconnectAttemptsRef.current = 0
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        wsRef.current.onmessage = (event) => {
          // Next.js ya maneja el hot reload automáticamente
          // Solo escuchamos mensajes explícitos de recarga completa
          try {
            const data = JSON.parse(event.data)
            
            // Solo recargar si es un mensaje explícito de recarga completa
            // No recargar en "building" o "built" porque Next.js ya lo maneja
            if (data.action === "reload" && !isReloadingRef.current) {
              isReloadingRef.current = true
              window.location.reload()
            }
          } catch (error) {
            // Si el mensaje no es JSON, verificar si es un string de recarga explícito
            if (event.data === "reload" && !isReloadingRef.current) {
              isReloadingRef.current = true
              window.location.reload()
            }
          }
        }

        wsRef.current.onerror = () => {
          // Error en WebSocket - cerrar y intentar reconectar
          wsRef.current?.close()
        }

        wsRef.current.onclose = () => {
          // WebSocket cerrado - el servidor probablemente se reinició
          if (!isReloadingRef.current) {
            reconnectAttemptsRef.current++
            
            // Esperar un momento para que el servidor se reinicie
            reconnectTimeoutRef.current = setTimeout(() => {
              // Intentar reconectar
              connectWebSocket()
              
              // Si después de varios intentos no funciona, recargar
              if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                setTimeout(() => {
                  if (wsRef.current?.readyState !== WebSocket.OPEN && !isReloadingRef.current) {
                    isReloadingRef.current = true
                    window.location.reload()
                  }
                }, 2000)
              }
            }, 3000) // Esperar 3 segundos antes de reconectar
          }
        }
      } catch (error) {
        // Si WebSocket falla completamente, no hacer nada
        // Next.js hot reload debería funcionar sin esto
        console.warn("⚠️ No se pudo conectar WebSocket para auto-reload. El hot reload de Next.js seguirá funcionando.")
      }
    }

    // Intentar conectar WebSocket
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [])

  return null
}

