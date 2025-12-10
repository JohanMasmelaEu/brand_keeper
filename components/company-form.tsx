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
import { createCompanySchema, updateCompanySchema } from "@/lib/validations/schemas"
import type { CreateCompanyFormData, UpdateCompanyFormData } from "@/lib/validations/schemas"
import { useRouter } from "next/navigation"
import type { Company } from "@/lib/types/user"
import { X, Plus, Save } from "lucide-react"

interface CompanyFormProps {
  company?: Company
  mode: "create" | "edit"
  onFormReady?: (form: ReturnType<typeof useForm>, isSubmitting: boolean, onSubmit: (data: any) => Promise<void>) => void
  onFormChange?: (values: Partial<CreateCompanyFormData | UpdateCompanyFormData>) => void
}

export function CompanyForm({ company, mode, onFormReady, onFormChange }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
    }
    
    // Serializar valores para comparación
    const currentValuesStr = JSON.stringify(currentValues)
    
    // Solo actualizar si los valores realmente cambiaron
    if (currentValuesStr !== previousValuesRef.current) {
      previousValuesRef.current = currentValuesStr
      onFormChange(currentValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, legal_name, website, logo_url, address, country])

  const onSubmit = async (data: CreateCompanyFormData | UpdateCompanyFormData) => {
    setIsSubmitting(true)
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
        return
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

        {/* Row 2: Sitio web, URL del logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com"
                    {...field}
                  />
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
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com/logo.png"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL del logo de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: País, Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Colombia"
                    {...field}
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
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Calle Principal 123, Ciudad, Estado"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Dirección completa de la empresa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}

