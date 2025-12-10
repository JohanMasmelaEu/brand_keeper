"use client"

/**
 * Componente reutilizable para selección de países
 * 
 * Características:
 * - Búsqueda de países en tiempo real
 * - Agrupación por regiones (Europa, Sudamérica, Otros)
 * - Visualización de banderas (emojis)
 * - Integración con react-hook-form
 * - Carga automática de países desde la API
 * 
 * Ejemplo de uso con react-hook-form:
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="country"
 *   render={({ field }) => (
 *     <FormItem className="flex flex-col">
 *       <FormLabel>País</FormLabel>
 *       <FormControl>
 *         <CountrySelect
 *           value={field.value}
 *           onChange={field.onChange}
 *           placeholder="Seleccionar país..."
 *         />
 *       </FormControl>
 *       <FormDescription>País donde opera la empresa (opcional)</FormDescription>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 * 
 * Ejemplo de uso standalone:
 * ```tsx
 * <CountrySelect
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   label="País"
 *   description="Selecciona tu país"
 *   placeholder="Elige un país..."
 * />
 * ```
 */

import * as React from "react"
import { Check, ChevronDown, MapPin } from "lucide-react"
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
import { cn } from "@/lib/utils"
import type { Country } from "@/lib/types/country"
import { getCountryFlagByName } from "@/lib/utils/country"

interface CountrySelectProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  description?: string
  error?: string
}

/**
 * Componente reutilizable para seleccionar países
 * Incluye búsqueda, agrupación por regiones y visualización de banderas
 */
export function CountrySelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar país...",
  label,
  description,
  error,
}: CountrySelectProps) {
  const [countries, setCountries] = React.useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(true)
  const [isOpen, setIsOpen] = React.useState(false)

  // Función para obtener el nombre de la región en español
  const getRegionName = (region: string): string => {
    const regionNames: Record<string, string> = {
      europe: "Europa",
      south_america: "Sudamérica",
      other: "Otros",
    }
    return regionNames[region] || region
  }

  // Orden de las regiones para mostrar
  const regionOrder = ["europe", "south_america", "other"]

  // Obtener el país seleccionado para mostrar su emoji
  const selectedCountry = React.useMemo(() => {
    if (!value || !countries.length) return null
    // Buscar coincidencia exacta primero
    let found = countries.find((c) => c.name === value)
    // Si no hay coincidencia exacta, buscar sin importar mayúsculas/minúsculas
    if (!found) {
      found = countries.find((c) => c.name.toLowerCase() === value.toLowerCase())
    }
    return found || null
  }, [value, countries])

  // Función para obtener el emoji de un país
  const getCountryEmoji = (countryName: string): string => {
    return getCountryFlagByName(countryName, countries)
  }

  // Cargar países al montar el componente
  React.useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch("/api/countries")
        if (response.ok) {
          const data = await response.json()
          setCountries(data.countries || [])
        } else {
          console.error("Error al cargar países")
        }
      } catch (error) {
        console.error("Error inesperado al cargar países:", error)
      } finally {
        setIsLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [])

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between pl-10",
              !value && "text-muted-foreground"
            )}
            disabled={disabled || isLoadingCountries}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
              <div className="flex items-center justify-center shrink-0 -ml-7">
                {selectedCountry ? (
                  <span className="text-base leading-[1.2rem] inline-block align-middle">
                    {getCountryEmoji(selectedCountry.name)}
                  </span>
                ) : (
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 truncate text-sm leading-[1.2rem]">
                {value
                  ? countries.find((country) => country.name === value)?.name
                  : placeholder}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandList>
              <CommandEmpty>
                {isLoadingCountries ? "Cargando países..." : "No se encontraron países."}
              </CommandEmpty>
              {regionOrder
                .filter((region) => {
                  const regionCountries = countries.filter(
                    (c) => (c.region || "other") === region
                  )
                  return regionCountries.length > 0
                })
                .map((region) => {
                  const regionCountries = countries.filter(
                    (c) => (c.region || "other") === region
                  )
                  return (
                    <CommandGroup key={region} heading={getRegionName(region)}>
                      {regionCountries.map((country) => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          onSelect={() => {
                            onChange(country.name)
                            setIsOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === country.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="mr-2">{getCountryFlagByName(country.name, countries)}</span>
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                })}
              {/* Mostrar otras regiones que no estén en el orden definido */}
              {Object.entries(
                countries.reduce((acc, country) => {
                  const region = country.region || "other"
                  if (!regionOrder.includes(region)) {
                    if (!acc[region]) acc[region] = []
                    acc[region].push(country)
                  }
                  return acc
                }, {} as Record<string, Country[]>)
              ).map(([region, regionCountries]) => (
                <CommandGroup key={region} heading={getRegionName(region)}>
                  {regionCountries.map((country) => (
                    <CommandItem
                      key={country.id}
                      value={country.name}
                      onSelect={() => {
                        onChange(country.name)
                        setIsOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === country.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="mr-2">{getCountryFlagByName(country.name, countries)}</span>
                      {country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}

/**
 * Versión del componente integrada con react-hook-form
 * Para usar dentro de un FormField de Shadcn UI
 * 
 * Ejemplo de uso:
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="country"
 *   render={({ field }) => (
 *     <FormItem className="flex flex-col">
 *       <FormLabel>País</FormLabel>
 *       <FormControl>
 *         <CountrySelect
 *           value={field.value}
 *           onChange={field.onChange}
 *           placeholder="Seleccionar país..."
 *         />
 *       </FormControl>
 *       <FormDescription>País donde opera la empresa (opcional)</FormDescription>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 */

