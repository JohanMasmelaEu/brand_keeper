"use client"

import { useEffect, useState } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"

/**
 * Wrapper para SpeedInsights que solo se renderiza en el cliente
 * para evitar problemas de hidratación
 */
export function SpeedInsightsWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <SpeedInsights />
}

