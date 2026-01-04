"use client"

import * as React from "react"
import { CompanyForm } from "@/components/company-form"
import { CompanyFormActions } from "@/components/company-form-actions"
import { CompanyDocumentView } from "@/components/company-document-view"
import type { Company } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"
import type { SocialMediaType } from "@/lib/types/social-media"

export function CompanyCreateClient() {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<any>>({})
  const [socialMedia, setSocialMedia] = React.useState<Array<{ type: SocialMediaType; url: string }>>([])

  const handleFormReady = React.useCallback((
    formInstance: UseFormReturn<any>,
    submitting: boolean,
    submitHandler: (data: any) => Promise<void>
  ) => {
    setForm(formInstance)
    setIsSubmitting(submitting)
    setOnSubmit(() => submitHandler)
  }, [])

  const handleFormChange = React.useCallback((values: Partial<any>) => {
    setFormValues(values)
    // Extraer redes sociales si están en los valores
    if (values.socialMedia) {
      setSocialMedia(values.socialMedia)
    }
  }, [])

  // Crear un objeto Company con placeholders para mostrar en el documento
  const displayCompany = React.useMemo((): Company => {
    const now = new Date().toISOString()
    return {
      id: "placeholder-id",
      name: formValues.name || "Nombre de la Empresa",
      slug: "placeholder-slug",
      is_parent: false,
      parent_company_id: null,
      website: formValues.website || null,
      logo_url: formValues.logo_url || null,
      // Para campos opcionales, usar null para que se muestre "No especificado"
      // Solo usar placeholder si el campo tiene un valor vacío string
      legal_name: formValues.legal_name || null,
      address: formValues.address || null,
      country: formValues.country || null,
      created_at: now,
      updated_at: now,
    }
  }, [formValues])

  return (
    <>
      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Visualización tipo documento */}
        <div className="w-full relative">
          <CompanyDocumentView 
            company={displayCompany} 
            socialMedia={socialMedia.map(sm => ({
              id: `temp-${sm.type}`,
              company_id: "placeholder-id",
              type: sm.type,
              url: sm.url,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))}
            isLoading={false}
            showSuccess={false}
            isCreating={true}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <CompanyForm 
            mode="create" 
            onFormReady={handleFormReady}
            onFormChange={handleFormChange}
          />
        </div>
      </div>

      {/* Botones de acción en fila completa centrada */}
      {form && onSubmit && (
        <CompanyFormActions
          mode="create"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

