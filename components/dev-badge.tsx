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
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-md bg-red-600 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-lg ring-2 ring-red-400/50 animate-pulse">
        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white flex-shrink-0" />
        <span className="whitespace-nowrap">MODO DESARROLLO</span>
      </div>
    </div>
  )
}

