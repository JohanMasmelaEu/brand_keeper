"use client"

import * as React from "react"
import { Check, X, AlertCircle, Info, CheckCircle2, CircleCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Variant = "success" | "error" | "warning" | "info"
type Size = "sm" | "md" | "lg"
type Position = "center" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
type DisplayMode = "overlay" | "inline"

interface CheckSealAnimationProps {
  /** Variante de la animación (success, error, warning, info) */
  variant?: Variant
  /** Tamaño de la animación */
  size?: Size
  /** Posición cuando se usa como overlay */
  position?: Position
  /** Modo de visualización: overlay (absoluto) o inline (relativo) */
  displayMode?: DisplayMode
  /** Clase CSS adicional para el contenedor */
  className?: string
  /** Clase CSS adicional para el icono */
  iconClassName?: string
  /** Icono personalizado (opcional, sobrescribe el icono por defecto de la variante) */
  icon?: LucideIcon
  /** Duración en milisegundos antes de ocultar automáticamente (0 = no ocultar) */
  autoHideDuration?: number
  /** Callback cuando la animación se oculta automáticamente */
  onHide?: () => void
  /** Mostrar u ocultar la animación */
  show?: boolean
  /** Mensaje de texto opcional debajo del icono */
  message?: string
}

const variantConfig: Record<
  Variant,
  {
    icon: LucideIcon
    textColor: string
    borderColor: string
    bgColor: string
  }
> = {
  success: {
    icon: Check,
    textColor: "text-primary-foreground",
    borderColor: "border-primary",
    bgColor: "bg-primary",
  },
  error: {
    icon: X,
    textColor: "text-destructive-foreground",
    borderColor: "border-destructive",
    bgColor: "bg-destructive",
  },
  warning: {
    icon: AlertCircle,
    textColor: "text-yellow-50",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500",
  },
  info: {
    icon: Info,
    textColor: "text-blue-50",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500",
  },
}

const sizeConfig: Record<Size, { container: string; icon: string; rings: number }> = {
  sm: {
    container: "w-20 h-20",
    icon: "h-6 w-6",
    rings: 3,
  },
  md: {
    container: "w-32 h-32",
    icon: "h-12 w-12",
    rings: 5,
  },
  lg: {
    container: "w-40 h-40",
    icon: "h-16 w-16",
    rings: 6,
  },
}

const positionConfig: Record<Position, string> = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-8",
  bottom: "items-end justify-center pb-8",
  "top-left": "items-start justify-start pt-8 pl-8",
  "top-right": "items-start justify-end pt-8 pr-8",
  "bottom-left": "items-end justify-start pb-8 pl-8",
  "bottom-right": "items-end justify-end pb-8 pr-8",
}

/**
 * Componente de animación de check con efecto de sello
 * Reutilizable para diferentes variantes, tamaños y posiciones
 * 
 * @example
 * // Uso básico (success, overlay, center)
 * <CheckSealAnimation show={isSuccess} />
 * 
 * @example
 * // Con variante error y auto-hide
 * <CheckSealAnimation 
 *   variant="error" 
 *   show={hasError}
 *   autoHideDuration={3000}
 *   onHide={() => setHasError(false)}
 * />
 * 
 * @example
 * // Inline con mensaje
 * <CheckSealAnimation 
 *   variant="success"
 *   displayMode="inline"
 *   size="sm"
 *   message="Guardado exitosamente"
 * />
 */
export function CheckSealAnimation({
  variant = "success",
  size = "md",
  position = "center",
  displayMode = "overlay",
  className,
  iconClassName,
  icon: CustomIcon,
  autoHideDuration = 0,
  onHide,
  show = true,
  message,
}: CheckSealAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(show)
  const config = variantConfig[variant]
  const sizeConfigValue = sizeConfig[size]
  const Icon = CustomIcon || config.icon

  React.useEffect(() => {
    setIsVisible(show)
  }, [show])

  React.useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onHide?.()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHideDuration, onHide])

  if (!isVisible) return null

  const containerClasses = cn(
    displayMode === "overlay" && "absolute inset-0 z-50 pointer-events-none rounded-lg",
    displayMode === "inline" && "relative",
    "flex",
    positionConfig[position],
    className
  )

  return (
    <div className={containerClasses}>
      {/* Icono */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2" style={{ width: "fit-content", height: "fit-content" }}>
        <div
          className={cn(
            "rounded-full flex items-center justify-center shadow-2xl",
            config.bgColor
          )}
          style={{
            width: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            height: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            minWidth: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            minHeight: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            maxWidth: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            maxHeight: size === "sm" ? "64px" : size === "md" ? "80px" : "96px",
            borderRadius: "50%",
            aspectRatio: "1 / 1",
            animation: "scale-in-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            transformOrigin: "center center",
            boxSizing: "border-box",
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Icon
            className={cn(
              sizeConfigValue.icon,
              config.textColor,
              "stroke-[3]",
              iconClassName
            )}
            style={{
              width: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
              height: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
              flexShrink: 0,
              display: "block",
            }}
          />
        </div>
        {message && (
          <p className="text-sm font-medium text-foreground animate-in fade-in duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

