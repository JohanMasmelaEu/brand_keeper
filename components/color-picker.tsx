"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
  required?: boolean
  disabled?: boolean
  showToggle?: boolean
  onToggle?: (enabled: boolean) => void
  toggleDisabled?: boolean
}

export function ColorPicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  showToggle = false,
  onToggle,
  toggleDisabled = false,
}: ColorPickerProps) {
  const [hexValue, setHexValue] = React.useState(value || "")
  const isActive = Boolean(value && value.length === 7)

  React.useEffect(() => {
    setHexValue(value || "")
  }, [value])

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Asegurar que comience con #
    if (!newValue.startsWith("#")) {
      newValue = "#" + newValue.replace(/^#/, "")
    }

    // Limitar a 7 caracteres (#RRGGBB)
    if (newValue.length > 7) {
      newValue = newValue.slice(0, 7)
    }

    // Validar formato hexadecimal
    const hexRegex = /^#[0-9A-Fa-f]{0,6}$/
    if (hexRegex.test(newValue) || newValue === "#") {
      setHexValue(newValue)
      // Solo actualizar si tiene 7 caracteres (formato completo)
      if (newValue.length === 7) {
        onChange(newValue)
      }
    }
  }

  const handleHexInputBlur = () => {
    // Si el valor no está completo, completar con ceros
    if (hexValue.length < 7 && hexValue.length > 0) {
      const padded = hexValue.padEnd(7, "0")
      setHexValue(padded)
      onChange(padded)
    }
  }

  const handleToggle = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked)
      if (!checked) {
        // Si se desactiva, limpiar el valor
        setHexValue("")
        onChange("")
      } else {
        // Si se activa, establecer un valor por defecto si no hay
        if (!hexValue || hexValue.length < 7) {
          const defaultColor = "#000000"
          setHexValue(defaultColor)
          onChange(defaultColor)
        }
      }
    }
  }


  // Función para calcular el contraste (blanco o negro) basado en el brillo del color
  const getContrastColor = (hexColor: string): string => {
    // Remover el # si existe
    const hex = hexColor.replace('#', '')
    
    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Calcular el brillo relativo usando la fórmula de luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Si el brillo es mayor a 0.5, usar texto negro, sino usar blanco
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  // Función para determinar si el color es similar al fondo del card (muy claro)
  const needsBorder = (hexColor: string): boolean => {
    if (!hexColor || hexColor.length < 7) return false
    
    // Remover el # si existe
    const hex = hexColor.replace('#', '')
    
    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Calcular el brillo relativo usando la fórmula de luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Si la luminancia es mayor a 0.85, el color es muy claro y similar al fondo blanco
    // Por lo tanto necesita un borde para ser visible
    return luminance > 0.85
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`color-${label}`}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <div
              className={`h-10 w-10 rounded-full shadow-sm ${needsBorder(hexValue) ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: hexValue }}
              aria-label="Vista previa del color"
            />
            <Input
              type="text"
              value={hexValue}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              disabled={disabled}
              placeholder="#000000"
              maxLength={7}
              className="flex-1 font-mono"
            />
            {showToggle && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggle}
                  disabled={disabled || toggleDisabled}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Inactivar</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className="h-10 w-10 rounded-full shadow-sm border border-gray-300 bg-gray-100"
              aria-label="Vista previa del color (inactivo)"
            />
            <Input
              type="text"
              value=""
              disabled
              placeholder="#000000"
              className="flex-1 font-mono bg-muted"
            />
            {showToggle && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={false}
                  onCheckedChange={handleToggle}
                  disabled={disabled || toggleDisabled}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Activar</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

