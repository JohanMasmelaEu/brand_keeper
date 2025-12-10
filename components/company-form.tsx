"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createCompanySchema, updateCompanySchema } from "@/lib/validations/schemas"
import type { CreateCompanyFormData, UpdateCompanyFormData } from "@/lib/validations/schemas"
import { useRouter } from "next/navigation"
import type { Company } from "@/lib/types/user"
import { X, Plus, Save } from "lucide-react"
import { CountrySelect } from "@/components/country-select"
import { CompanySocialMediaForm } from "@/components/company-social-media-form"
import { cn } from "@/lib/utils"
import type { SocialMediaType } from "@/lib/types/social-media"
import { Skeleton } from "@/components/ui/skeleton"

interface CompanyFormProps {
  company?: Company
  mode: "create" | "edit"
  onFormReady?: (form: ReturnType<typeof useForm>, isSubmitting: boolean, onSubmit: (data: any) => Promise<void>) => void
  onFormChange?: (values: Partial<CreateCompanyFormData | UpdateCompanyFormData>) => void
}

export function CompanyForm({ company, mode, onFormReady, onFormChange }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [socialMedia, setSocialMedia] = React.useState<Array<{ type: SocialMediaType; url: string }>>([])
  const [isLoadingSocialMedia, setIsLoadingSocialMedia] = React.useState(false)
  
  // Ref para mantener el estado actual de socialMedia y evitar problemas de closure
  const socialMediaRef = React.useRef<Array<{ type: SocialMediaType; url: string }>>([])
  
  // Actualizar el ref cada vez que cambia el estado
  React.useEffect(() => {
    socialMediaRef.current = socialMedia
  }, [socialMedia])
  
  // Wrapper para setSocialMedia
  const handleSocialMediaChange = React.useCallback((newSocialMedia: Array<{ type: SocialMediaType; url: string }>) => {
    setSocialMedia(newSocialMedia)
    socialMediaRef.current = newSocialMedia
  }, [])

  const schema = mode === "create" ? createCompanySchema : updateCompanySchema
  const form = useForm<CreateCompanyFormData | UpdateCompanyFormData>({
    resolver: zodResolver(schema),
    defaultValues: company
      ? {
          name: company.name,
          website: company.website || "",
          logo_url: company.logo_url || "",
          legal_name: company.legal_name || "",
          address: company.address || "",
          country: company.country || "",
        }
      : {
          name: "",
          website: "",
          logo_url: "",
          legal_name: "",
          address: "",
          country: "",
        },
  })

  // Observar cambios en el formulario para actualizar el documento en tiempo real
  const name = form.watch("name")
  const legal_name = form.watch("legal_name")
  const website = form.watch("website")
  const logo_url = form.watch("logo_url")
  const address = form.watch("address")
  const country = form.watch("country")
  
  const previousValuesRef = React.useRef<string>("")
  
  React.useEffect(() => {
    if (!onFormChange) return
    
    const currentValues = {
      name,
      legal_name,
      website,
      logo_url,
      address,
      country,
      socialMedia, // Incluir redes sociales en los valores del formulario
    }
    
    // Serializar valores para comparación
    const currentValuesStr = JSON.stringify(currentValues)
    
    // Solo actualizar si los valores realmente cambiaron
    if (currentValuesStr !== previousValuesRef.current) {
      previousValuesRef.current = currentValuesStr
      onFormChange(currentValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, legal_name, website, logo_url, address, country, socialMedia])

  const onSubmit = async (data: CreateCompanyFormData | UpdateCompanyFormData) => {
    setIsSubmitting(true)
    
    // Usar el ref para obtener el estado más reciente (evita problemas de closure)
    const currentSocialMedia = socialMediaRef.current
    
    try {
      const url = mode === "create" ? "/api/companies" : `/api/companies/${company?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || `Error al ${mode === "create" ? "crear" : "actualizar"} la empresa`)
        setIsSubmitting(false)
        return
      }

      // Guardar redes sociales si hay una empresa creada/actualizada
      // Siempre guardar, incluso si el array está vacío (para eliminar todas las redes sociales)
      const companyId = result.company?.id || company?.id
      
      // Usar el ref para obtener el estado más reciente
      const currentSocialMedia = socialMediaRef.current
      
      if (companyId) {
        try {
          const socialMediaPayload = { socialMedia: currentSocialMedia }
          
          const socialMediaResponse = await fetch(`/api/companies/${companyId}/social-media`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(socialMediaPayload),
          })

          if (!socialMediaResponse.ok) {
            const errorData = await socialMediaResponse.json().catch(() => ({}))
            console.error("Error guardando redes sociales:", errorData)
            alert(errorData.error || "Error al guardar las redes sociales. Por favor, inténtalo de nuevo.")
          }
        } catch (error) {
          console.error("Error guardando redes sociales:", error)
          alert("Error inesperado al guardar las redes sociales. Por favor, inténtalo de nuevo.")
        }
      }

      // Si es modo edición, esperar 2 segundos antes de redirigir para mostrar la animación de éxito
      if (mode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Redirigir a la lista de empresas
      router.push("/dashboard/companies")
      router.refresh()
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creando" : "actualizando"} empresa:`, error)
      alert(`Error inesperado al ${mode === "create" ? "crear" : "actualizar"} la empresa`)
    } finally {
      setIsSubmitting(false)
    }
  }


  // Cargar redes sociales existentes cuando se edita una empresa
  // Solo cargar una vez al montar el componente, no cuando cambia el estado
  const hasLoadedSocialMediaRef = React.useRef(false)
  
  React.useEffect(() => {
    async function loadSocialMedia() {
      // Solo cargar si no se ha cargado antes y estamos en modo edición
      if (company?.id && mode === "edit" && !hasLoadedSocialMediaRef.current) {
        setIsLoadingSocialMedia(true)
        try {
          const response = await fetch(`/api/companies/${company.id}/social-media`)
          if (response.ok) {
            const data = await response.json()
            const formatted = (data.socialMedia || []).map((sm: any) => ({
              type: sm.type,
              url: sm.url,
            }))
            setSocialMedia(formatted)
            hasLoadedSocialMediaRef.current = true
          }
        } catch (error) {
          console.error("Error cargando redes sociales:", error)
        } finally {
          setIsLoadingSocialMedia(false)
        }
      }
    }
    loadSocialMedia()
  }, [company?.id, mode])

  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(form, isSubmitting, onSubmit)
    }
  }, [form, isSubmitting, onFormReady])


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Nombre de la empresa, Nombre legal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Empresa Hija S.A."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  El nombre completo de la empresa
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Legal</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Empresa Hija S.A. Razón Social"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Nombre legal o razón social de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: País, Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>País</FormLabel>
                <FormControl>
                  <CountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar país..."
                  />
                </FormControl>
                <FormDescription>
                  País donde opera la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Textarea
                          placeholder="Ej: Calle Principal 123, Ciudad, Estado"
                          rows={1}
                          className={cn(
                            "resize-none !min-h-[2.5rem] !h-10 overflow-hidden",
                            field.value && field.value.length > 0 && "cursor-pointer"
                          )}
                          style={{ 
                            minHeight: '2.5rem',
                            height: '2.5rem',
                            lineHeight: '1.25rem'
                          }}
                          {...field}
                        />
                      </TooltipTrigger>
                      {field.value && field.value.trim().length > 0 && (
                        <TooltipContent side="top" className="max-w-md">
                          <p className="whitespace-pre-wrap break-words">{field.value}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </FormControl>
                <FormDescription>
                  Dirección completa de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Sitio web, URL del logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-0 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md focus-within:outline-none">
                    <Input
                      type="url"
                      placeholder="https://www.ejemplo.com"
                      {...field}
                      className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-l-none border-l-0 shrink-0"
                        onClick={() => {
                          field.onChange("")
                          // Actualizar el documento cuando se limpia
                          if (onFormChange) {
                            const currentValues = {
                              name: form.getValues("name"),
                              legal_name: form.getValues("legal_name"),
                              website: "",
                              logo_url: form.getValues("logo_url"),
                              address: form.getValues("address"),
                              country: form.getValues("country"),
                              socialMedia,
                            }
                            onFormChange(currentValues)
                          }
                        }}
                        title="Limpiar campo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  URL del sitio web de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del Logo</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-0 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md focus-within:outline-none">
                    <Input
                      type="url"
                      placeholder="https://www.ejemplo.com/logo.png"
                      {...field}
                      className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      onBlur={(e) => {
                        field.onBlur()
                        // Forzar actualización del documento cuando pierde el focus
                        if (onFormChange) {
                          const currentValues = {
                            name: form.getValues("name"),
                            legal_name: form.getValues("legal_name"),
                            website: form.getValues("website"),
                            logo_url: e.target.value,
                            address: form.getValues("address"),
                            country: form.getValues("country"),
                            socialMedia,
                          }
                          onFormChange(currentValues)
                        }
                      }}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-l-none border-l-0 shrink-0"
                        onClick={() => {
                          field.onChange("")
                          // Actualizar el documento cuando se limpia
                          if (onFormChange) {
                            const currentValues = {
                              name: form.getValues("name"),
                              legal_name: form.getValues("legal_name"),
                              website: form.getValues("website"),
                              logo_url: "",
                              address: form.getValues("address"),
                              country: form.getValues("country"),
                              socialMedia,
                            }
                            onFormChange(currentValues)
                          }
                        }}
                        title="Limpiar campo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  URL del logo de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Redes Sociales */}
        {isLoadingSocialMedia ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-40" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-9 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <CompanySocialMediaForm
            value={socialMedia}
            onChange={handleSocialMediaChange}
            disabled={isSubmitting}
          />
        )}
      </form>
    </Form>
  )
}

