"use client"

import * as React from "react"
import Image from "next/image"
import { GoogleFontSelector } from "@/components/google-font-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  includeSystemFonts?: boolean
  disabled?: boolean
  required?: boolean
  label?: string
  showToggle?: boolean
  onToggle?: (enabled: boolean) => void
  toggleDisabled?: boolean
}

// Fuentes del sistema comunes
const SYSTEM_FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Georgia", label: "Georgia" },
  { value: "Palatino", label: "Palatino" },
  { value: "Garamond", label: "Garamond" },
  { value: "Bookman", label: "Bookman" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Arial Black", label: "Arial Black" },
  { value: "Impact", label: "Impact" },
]

export function FontSelector({
  value,
  onChange,
  includeSystemFonts = true,
  disabled = false,
  required = false,
  label = "Fuente",
  showToggle = false,
  onToggle,
  toggleDisabled = false,
}: FontSelectorProps) {
  const isActive = Boolean(value && value.trim() !== "")
  
  const [fontType, setFontType] = React.useState<"system" | "google">(() => {
    // Determinar si el valor actual es una fuente del sistema o Google Font
    if (!value) return "system"
    const isSystemFont = SYSTEM_FONTS.some((font) => font.value === value)
    return isSystemFont ? "system" : "google"
  })

  // Sincronizar el tipo de fuente cuando cambia el valor desde fuera
  // Solo sincronizar si hay un valor válido y es diferente al tipo actual
  React.useEffect(() => {
    if (value && value.trim() !== "") {
      const isSystemFont = SYSTEM_FONTS.some((font) => font.value === value)
      const newFontType = isSystemFont ? "system" : "google"
      // Solo actualizar si el tipo inferido del valor es diferente al tipo actual
      // Esto permite que el usuario mantenga el tipo seleccionado manualmente
      setFontType((currentType) => {
        // Si el valor actual es una fuente del sistema, debe ser "system"
        // Si el valor actual es una Google Font, debe ser "google"
        // Pero solo cambiar si realmente es necesario
        if (isSystemFont && currentType !== "system") {
          return "system"
        }
        if (!isSystemFont && currentType !== "google") {
          return "google"
        }
        return currentType
      })
    }
    // Si no hay valor, mantener el tipo actual (no resetear a "system")
  }, [value])

  const handleToggle = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked)
      if (!checked) {
        // Si se desactiva, limpiar el valor
        onChange("")
      } else {
        // Si se activa, establecer un valor por defecto según el tipo actual
        if (!value || value.trim() === "") {
          if (fontType === "system") {
            onChange("Arial")
          } else {
            // Si está en modo Google, no establecer un valor por defecto
            // El campo estará habilitado para que el usuario seleccione una fuente de Google
            // No llamar a onChange aquí para no interferir con la selección del usuario
          }
        }
      }
    } else {
      // Si no hay onToggle, manejar directamente
      if (!checked) {
        onChange("")
      } else {
        if (!value || value.trim() === "") {
          if (fontType === "system") {
            onChange("Arial")
          }
          // En modo Google, dejar que el usuario seleccione sin establecer valor por defecto
        }
      }
    }
  }

  const handleFontTypeChange = (newType: "system" | "google") => {
    setFontType(newType)
    
    // Solo cambiar el tipo de fuente, sin afectar el estado de activación
    // El valor se mantiene o se ajusta solo si es necesario para la compatibilidad
    if (newType === "system") {
      // Si cambia a sistema y no hay valor o el valor actual no es una fuente del sistema, establecer Arial
      // Esto solo si realmente no hay valor válido
      if (!value || value.trim() === "") {
        onChange("Arial")
      } else if (!SYSTEM_FONTS.some((font) => font.value === value)) {
        // Si el valor actual no es una fuente del sistema válida, establecer Arial
        onChange("Arial")
      }
      // Si el valor actual es una fuente del sistema válida, mantenerlo
    } else {
      // Si cambia a Google, no modificar el valor automáticamente
      // Si hay una fuente del sistema, el usuario puede seleccionar una Google Font después
      // No limpiar el valor porque eso desactiva la fuente y afecta el toggle
      // El usuario puede seleccionar una fuente de Google cuando quiera
    }
  }

  const handleSystemFontChange = (newFont: string) => {
    onChange(newFont)
  }

  const handleGoogleFontChange = (newFont: string) => {
    onChange(newFont)
  }

  const renderFontSelector = () => {
    if (!includeSystemFonts) {
      // Si no se incluyen fuentes del sistema, usar solo Google Fonts
      return (
        <GoogleFontSelector
          value={value}
          onValueChange={handleGoogleFontChange}
          disabled={disabled}
        />
      )
    }

    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-auto shrink-0 p-1.5 hover:bg-transparent hover:scale-110 transition-transform"
            onClick={() => {
              handleFontTypeChange(fontType === "google" ? "system" : "google")
            }}
            disabled={disabled}
            aria-label={fontType === "google" ? "Cambiar a fuente del sistema" : "Cambiar a Google Fonts"}
          >
            <Image
              src={fontType === "google" ? "/images/GOOGLE_LOGO.png" : "/images/GOOGLE_OFF_LOGO.png"}
              alt={fontType === "google" ? "Google Fonts activo" : "Fuente del sistema"}
              width={18}
              height={18}
              className="h-4 w-auto object-contain transition-opacity"
            />
          </Button>
          <div className="flex-1">
            {fontType === "system" ? (
              <Select
                value={value || "Arial"}
                onValueChange={handleSystemFontChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <GoogleFontSelector
                value={value}
                onValueChange={handleGoogleFontChange}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          {renderFontSelector()}
        </div>
        {showToggle && (
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={disabled || toggleDisabled}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {isActive ? "Inactivar" : "Activar"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

