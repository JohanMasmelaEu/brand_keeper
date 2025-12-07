'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Error al cerrar sesión:', error)
        // Aún así redirigir al login
      }

      // Forzar una recarga completa para que el middleware detecte la sesión cerrada
      // y limpie el estado del servidor correctamente
      window.location.href = '/login'
    } catch (err) {
      console.error('Error inesperado al cerrar sesión:', err)
      // Aún así redirigir al login
      window.location.href = '/login'
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      className={cn("w-full sm:w-auto text-sm sm:text-base", className)}
    >
      {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </Button>
  )
}

