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
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CompanyFormProps {
  company?: Company
  mode: "create" | "edit"
}

export function CompanyForm({ company, mode }: CompanyFormProps) {
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


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                El nombre completo de la empresa (el slug se generará automáticamente)
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

        {/* Mostrar fechas de creación y actualización si estamos editando */}
        {mode === "edit" && company && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Fecha de Creación
              </label>
              <p className="text-sm">
                {format(new Date(company.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Última Actualización
              </label>
              <p className="text-sm">
                {format(new Date(company.updated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/companies")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creando..."
                : "Actualizando..."
              : mode === "create"
                ? "Crear Empresa"
                : "Actualizar Empresa"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

