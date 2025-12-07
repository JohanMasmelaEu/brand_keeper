/**
 * Badge que indica que la aplicación está en modo desarrollo
 * Solo se muestra cuando NODE_ENV === 'development'
 */
export function DevBadge() {
  // Solo mostrar en desarrollo
  // En Next.js, NODE_ENV está disponible en el servidor
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg ring-2 ring-red-400/50 animate-pulse">
        <div className="h-2 w-2 rounded-full bg-white" />
        <span>MODO DESARROLLO</span>
      </div>
    </div>
  )
}

