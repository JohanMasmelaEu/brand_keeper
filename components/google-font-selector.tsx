"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface GoogleFont {
  family: string
  variants?: string[]
  category?: string
}

interface GoogleFontSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function GoogleFontSelector({
  value,
  onValueChange,
  disabled = false,
}: GoogleFontSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [fonts, setFonts] = React.useState<GoogleFont[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Cargar fuentes cuando se abre el popover por primera vez
  React.useEffect(() => {
    if (open && fonts.length === 0 && !isLoading && !error) {
      loadFonts()
    }
  }, [open])

  const loadFonts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/google-fonts")
      if (!response.ok) {
        throw new Error("Error al cargar las fuentes")
      }
      const data = await response.json()
      setFonts(data.fonts || [])
    } catch (err) {
      console.error("Error al cargar Google Fonts:", err)
      setError("No se pudieron cargar las fuentes")
    } finally {
      setIsLoading(false)
    }
  }

  // Preparar lista de fuentes con opción de "Sin fuente personalizada"
  const fontOptions = React.useMemo(() => {
    const options = [{ value: "", label: "Sin fuente personalizada" }]
    fonts.forEach((font) => {
      options.push({
        value: font.family,
        label: font.family,
      })
    })
    return options
  }, [fonts])

  const selectedFont = React.useMemo(() => {
    if (!value) return null
    return fontOptions.find((font) => font.value === value)
  }, [value, fontOptions])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedFont ? selectedFont.label : "Seleccionar fuente..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar fuente..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Cargando fuentes...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-6 px-4">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFonts}
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontró la fuente.</CommandEmpty>
                <CommandGroup>
                  {fontOptions.map((font) => (
                    <CommandItem
                      key={font.value}
                      value={font.value}
                      onSelect={() => {
                        onValueChange(font.value === value ? "" : font.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === font.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span
                        style={
                          font.value
                            ? {
                                fontFamily: `"${font.value}", sans-serif`,
                              }
                            : undefined
                        }
                      >
                        {font.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Genera el HTML para incluir Google Fonts embebido en el HTML de la firma
 * @param fontName - Nombre de la fuente de Google Fonts
 * @returns HTML con el tag <style> que incluye @import de Google Fonts
 */
export function generateGoogleFontStyle(fontName: string): string {
  if (!fontName || fontName.trim() === "") {
    return ""
  }

  // Escapar el nombre de la fuente para la URL
  const escapedFontName = encodeURIComponent(fontName)

  // Generar el tag <style> con @import de Google Fonts
  // Usamos @import porque es más compatible con clientes de email
  return `<style>
@import url('https://fonts.googleapis.com/css2?family=${escapedFontName}:wght@300;400;500;600;700&display=swap');
</style>`
}

/**
 * Aplica la fuente de Google Fonts al HTML de la firma
 * @param html - HTML de la firma
 * @param fontName - Nombre de la fuente de Google Fonts
 * @returns HTML con la fuente aplicada
 */
export function applyGoogleFontToHtml(html: string, fontName: string): string {
  if (!fontName || fontName.trim() === "") {
    return html
  }

  const fontStyle = generateGoogleFontStyle(fontName)
  const fontFamilyStyle = `font-family: '${fontName}', sans-serif;`

  // Verificar si ya existe un tag <style>
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/i
  const existingStyleMatch = html.match(styleTagRegex)

  if (existingStyleMatch) {
    // Si ya tiene el @import con esta fuente, no agregarlo de nuevo
    if (existingStyleMatch[1].includes("@import") && existingStyleMatch[1].includes(fontName)) {
      return html
    }
    
    // Agregar el @import al contenido del style existente
    const newStyleContent = `${fontStyle.replace(/<\/?style[^>]*>/gi, "")}\n${existingStyleMatch[1]}`
    html = html.replace(styleTagRegex, `<style>${newStyleContent}</style>`)
  } else {
    // Agregar el tag <style> al inicio del HTML
    html = `${fontStyle}${html}`
  }

  // Agregar un estilo global para aplicar la fuente a todos los elementos
  // Esto es útil para emails donde queremos que la fuente se aplique automáticamente
  const globalStyle = `<style>
* { ${fontFamilyStyle} }
</style>`

  // Agregar el estilo global después del @import
  html = html.replace(
    /(@import[^;]+;[\s\S]*?<\/style>)/i,
    (match) => {
      return match.replace("</style>", `\n* { ${fontFamilyStyle} }\n</style>`)
    }
  )

  // Si no se agregó el estilo global (porque no había @import), agregarlo
  if (!html.includes("* {") || !html.includes(fontFamilyStyle)) {
    // Buscar el último </style> y agregar el estilo global antes
    const lastStyleIndex = html.lastIndexOf("</style>")
    if (lastStyleIndex !== -1) {
      html = html.slice(0, lastStyleIndex) + `\n* { ${fontFamilyStyle} }\n` + html.slice(lastStyleIndex)
    } else {
      // Si no hay ningún style, agregar uno nuevo
      html = `${fontStyle}\n<style>\n* { ${fontFamilyStyle} }\n</style>${html}`
    }
  }

  return html
}

