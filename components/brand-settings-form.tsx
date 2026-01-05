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
import { createBrandSettingsSchema, updateBrandSettingsSchema } from "@/lib/validations/schemas"
import type {
  CreateBrandSettingsFormData,
  UpdateBrandSettingsFormData,
} from "@/lib/validations/schemas"
import { useRouter } from "next/navigation"
import type { BrandSettings } from "@/lib/types/brand"
import { ColorPicker } from "@/components/color-picker"
import { FontSelector } from "@/components/font-selector"
import { LogoUploader } from "@/components/logo-uploader"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { BrandSettingsFormActions } from "@/components/brand-settings-form-actions"

interface BrandSettingsFormProps {
  brandSettings?: BrandSettings
  mode: "create" | "edit"
  companyId: string
  userRole: "super_admin" | "admin"
  userCompanyId?: string
  onFormReady?: (
    form: ReturnType<typeof useForm>,
    isSubmitting: boolean,
    onSubmit: (data: any) => Promise<void>
  ) => void
  onFormChange?: (values: Partial<CreateBrandSettingsFormData | UpdateBrandSettingsFormData>) => void
}

export function BrandSettingsForm({
  brandSettings,
  mode,
  companyId,
  userRole,
  userCompanyId,
  onFormReady,
  onFormChange,
}: BrandSettingsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const schema = mode === "create" ? createBrandSettingsSchema : updateBrandSettingsSchema
  const form = useForm<CreateBrandSettingsFormData | UpdateBrandSettingsFormData>({
    resolver: zodResolver(schema),
    defaultValues: brandSettings
      ? {
          primary_color: brandSettings.primary_color,
          secondary_color: brandSettings.secondary_color || "",
          font_family: brandSettings.font_family,
          logo_url: brandSettings.logo_url || "",
        }
      : {
          company_id: companyId,
          primary_color: "#000000",
          secondary_color: "",
          font_family: "Arial",
          logo_url: "",
          is_global: false,
        },
  })

  // Observar cambios en el formulario
  const primaryColor = form.watch("primary_color")
  const secondaryColor = form.watch("secondary_color")
  const fontFamily = form.watch("font_family")
  const logoUrl = form.watch("logo_url")
  const isGlobal = form.watch("is_global")

  React.useEffect(() => {
    if (!onFormChange) return

    const currentValues = {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      font_family: fontFamily,
      logo_url: logoUrl,
    }

    onFormChange(currentValues)
  }, [primaryColor, secondaryColor, fontFamily, logoUrl, onFormChange])

  const onSubmit = async (data: CreateBrandSettingsFormData | UpdateBrandSettingsFormData) => {
    setIsSubmitting(true)

    try {
      if (mode === "create") {
        const createData = data as CreateBrandSettingsFormData
        const response = await fetch("/api/brand-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: companyId,
            primary_color: createData.primary_color,
            secondary_color: createData.secondary_color || null,
            font_family: createData.font_family,
            logo_url: createData.logo_url || null,
            is_global:
              userRole === "super_admin" && userCompanyId === companyId
                ? (createData.is_global || false)
                : false,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al crear la configuración de marca")
        }

        const result = await response.json()
        toast.success("Configuración de marca creada correctamente")
        router.push(`/dashboard/brand-settings`)
        router.refresh()
      } else {
        const updateData = data as UpdateBrandSettingsFormData
        const response = await fetch(`/api/brand-settings/${brandSettings?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            primary_color: updateData.primary_color,
            secondary_color: updateData.secondary_color || null,
            font_family: updateData.font_family,
            logo_url: updateData.logo_url || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al actualizar la configuración de marca")
        }

        toast.success("Configuración de marca actualizada correctamente")
        router.push(`/dashboard/brand-settings`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(form, isSubmitting, onSubmit)
    }
  }, [form, isSubmitting, onFormReady, onSubmit])

  // Determinar si se puede crear configuración global
  const canCreateGlobal =
    userRole === "super_admin" && userCompanyId === companyId && mode === "create"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Colores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorPicker
                    value={field.value || "#000000"}
                    onChange={field.onChange}
                    label="Color Primario"
                    required
                  />
                </FormControl>
                <FormDescription>Color principal de la marca</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorPicker
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Color Secundario"
                    required={false}
                  />
                </FormControl>
                <FormDescription>Color complementario de la marca (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fuente */}
        <FormField
          control={form.control}
          name="font_family"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FontSelector
                  value={field.value || "Arial"}
                  onChange={field.onChange}
                  includeSystemFonts={true}
                  required
                />
              </FormControl>
              <FormDescription>Tipografía principal de la marca</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo */}
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <LogoUploader
                  value={field.value || ""}
                  onChange={field.onChange}
                  companyId={companyId}
                  brandSettingsId={brandSettings?.id}
                />
              </FormControl>
              <FormDescription>
                Logo principal de la marca (PNG, JPG o SVG, máximo 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Configuración Global (solo para super_admin de empresa matriz en modo create) */}
        {canCreateGlobal && (
          <FormField
            control={form.control}
            name="is_global"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Configuración Global</FormLabel>
                  <FormDescription>
                    Esta configuración será compartida con todas las empresas hijas
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <BrandSettingsFormActions
          mode={mode}
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      </form>
    </Form>
  )
}

