"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus, Share2, Trash2, ExternalLink } from "lucide-react"
import {
  getAllSocialMediaConfigs,
  getSocialMediaConfig,
  type SocialMediaType,
} from "@/lib/types/social-media"
import { SocialMediaIcon } from "@/components/social-media-icons"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface SocialMediaEntry {
  type: SocialMediaType
  url: string
}

interface CompanySocialMediaFormProps {
  value: SocialMediaEntry[]
  onChange: (value: SocialMediaEntry[]) => void
  disabled?: boolean
}

/**
 * Componente para gestionar redes sociales de una empresa
 * Permite agregar/eliminar redes sociales y validar que no haya duplicados
 */
export function CompanySocialMediaForm({
  value = [],
  onChange,
  disabled = false,
}: CompanySocialMediaFormProps) {
  const [entries, setEntries] = React.useState<SocialMediaEntry[]>(value)
  const allConfigs = getAllSocialMediaConfigs()
  const previousValueRef = React.useRef<string>(JSON.stringify(value))

  // Sincronizar con el valor externo solo si cambió externamente
  // (no cuando cambiamos el estado interno)
  React.useEffect(() => {
    const currentValueStr = JSON.stringify(value)
    // Solo actualizar si el valor externo realmente cambió
    if (currentValueStr !== previousValueRef.current) {
      previousValueRef.current = currentValueStr
      setEntries(value)
    }
  }, [value])

  // Obtener tipos de redes sociales ya agregadas
  const usedTypes = React.useMemo(
    () => new Set(entries.map((e) => e.type)),
    [entries]
  )

  // Obtener tipos disponibles para agregar (los que no están en uso)
  const availableTypes = React.useMemo(
    () => allConfigs.filter((config) => !usedTypes.has(config.type)),
    [allConfigs, usedTypes]
  )

  // Agregar una nueva red social
  const handleAdd = () => {
    if (availableTypes.length === 0) return

    const newEntry: SocialMediaEntry = {
      type: availableTypes[0].type,
      url: "",
    }

    const updated = [...entries, newEntry]
    setEntries(updated)
    // Actualizar la referencia para evitar que el useEffect resetee
    previousValueRef.current = JSON.stringify(updated)
    onChange(updated)
  }

  // Eliminar una red social
  const handleRemove = (index: number) => {
    const updated = entries.filter((_, i) => i !== index)
    setEntries(updated)
    onChange(updated)
  }

  // Actualizar tipo de red social
  const handleTypeChange = (index: number, newType: SocialMediaType) => {
    // Verificar que el nuevo tipo no esté en uso
    if (usedTypes.has(newType) && entries[index].type !== newType) {
      return // No permitir duplicados
    }

    const updated = entries.map((entry, i) =>
      i === index ? { ...entry, type: newType, url: "" } : entry
    )
    setEntries(updated)
    onChange(updated)
  }

  // Actualizar URL de red social
  const handleUrlChange = (index: number, newUrl: string) => {
    const updated = entries.map((entry, i) =>
      i === index ? { ...entry, url: newUrl } : entry
    )
    setEntries(updated)
    // Actualizar la referencia para evitar que el useEffect resetee
    previousValueRef.current = JSON.stringify(updated)
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Redes Sociales</CardTitle>
          {availableTypes.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={disabled || availableTypes.length === 0}
              className="h-9 gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Agregar Red Social</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
            No hay redes sociales agregadas. Haz clic en "Agregar Red Social" para comenzar.
          </div>
        ) : entries.length > 3 ? (
          <div className="w-full" style={{ height: "13rem" }}>
            <ScrollArea className="h-full w-full">
              <div className="space-y-3 pr-4">
                {entries.map((entry, index) => {
                  const config = getSocialMediaConfig(entry.type)
                  const availableTypesForThis = [
                    ...allConfigs.filter((c) => c.type === entry.type),
                    ...availableTypes,
                  ]

                  return (
                    <div
                      key={`${entry.type}-${index}`}
                      className="flex items-start gap-2"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                        {/* Selector de tipo de red social */}
                        <div className={cn("space-y-1.5", index > 0 && "space-y-0")}>
                          {index === 0 && (
                            <Label htmlFor={`social-type-${index}`} className="text-xs">
                              Tipo
                            </Label>
                          )}
                          <Select
                            value={entry.type}
                            onValueChange={(newType) =>
                              handleTypeChange(index, newType as SocialMediaType)
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger id={`social-type-${index}`} className="h-9">
                              <SelectValue placeholder="Seleccionar red social" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTypesForThis.map((typeConfig) => (
                                <SelectItem
                                  key={typeConfig.type}
                                  value={typeConfig.type}
                                >
                                  <span className="flex items-center gap-2">
                                    <SocialMediaIcon type={typeConfig.type} size={16} className="text-muted-foreground" />
                                    <span>{typeConfig.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Input de URL */}
                        <div className={cn("space-y-1.5", index > 0 && "space-y-0")}>
                          {index === 0 && (
                            <Label htmlFor={`social-url-${index}`} className="text-xs">
                              URL
                            </Label>
                          )}
                          <div className="flex items-center gap-0 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md focus-within:outline-none">
                            <Input
                              id={`social-url-${index}`}
                              type="url"
                              placeholder={config.placeholder}
                              value={entry.url}
                              onChange={(e) => handleUrlChange(index, e.target.value)}
                              disabled={disabled}
                              className="h-9 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-l-none border-l-0 shrink-0"
                              onClick={() => {
                                if (entry.url && entry.url.trim()) {
                                  window.open(entry.url, "_blank", "noopener,noreferrer")
                                }
                              }}
                              disabled={disabled || !entry.url || !entry.url.trim()}
                              title="Abrir URL en nueva pestaña"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(index)}
                        disabled={disabled}
                        className={cn("h-9 w-9 shrink-0", index === 0 ? "mt-6" : "mt-0")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const config = getSocialMediaConfig(entry.type)
              const availableTypesForThis = [
                ...allConfigs.filter((c) => c.type === entry.type),
                ...availableTypes,
              ]

              return (
                <div
                  key={`${entry.type}-${index}`}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                      {/* Selector de tipo de red social */}
                      <div className={cn("space-y-1.5", index > 0 && "space-y-0")}>
                        {index === 0 && (
                          <Label htmlFor={`social-type-${index}`} className="text-xs">
                            Tipo
                          </Label>
                        )}
                        <Select
                          value={entry.type}
                          onValueChange={(newType) =>
                            handleTypeChange(index, newType as SocialMediaType)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger id={`social-type-${index}`} className="h-9">
                            <SelectValue placeholder="Seleccionar red social" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTypesForThis.map((typeConfig) => (
                              <SelectItem
                                key={typeConfig.type}
                                value={typeConfig.type}
                              >
                                <span className="flex items-center gap-2">
                                  <SocialMediaIcon type={typeConfig.type} size={16} className="text-muted-foreground" />
                                  <span>{typeConfig.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                    {/* Input de URL */}
                    <div className={cn("space-y-1.5", index > 0 && "space-y-0")}>
                      {index === 0 && (
                        <Label htmlFor={`social-url-${index}`} className="text-xs">
                          URL
                        </Label>
                      )}
                      <div className="flex items-center gap-0 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md focus-within:outline-none">
                        <Input
                          id={`social-url-${index}`}
                          type="url"
                          placeholder={config.placeholder}
                          value={entry.url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          disabled={disabled}
                          className="h-9 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-l-none border-l-0 shrink-0"
                          onClick={() => {
                            if (entry.url && entry.url.trim()) {
                              window.open(entry.url, "_blank", "noopener,noreferrer")
                            }
                          }}
                          disabled={disabled || !entry.url || !entry.url.trim()}
                          title="Abrir URL en nueva pestaña"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className={cn("h-9 w-9 shrink-0", index === 0 ? "mt-6" : "mt-0")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {availableTypes.length === 0 && entries.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Todas las redes sociales disponibles han sido agregadas.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

