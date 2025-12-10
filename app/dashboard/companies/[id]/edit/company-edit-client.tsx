"use client"

import * as React from "react"
import { CompanyForm } from "@/components/company-form"
import { CompanyFormActions } from "@/components/company-form-actions"
import { CompanyDocumentView } from "@/components/company-document-view"
import type { Company } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"
import type { CompanySocialMedia } from "@/lib/types/social-media"
import type { SocialMediaType } from "@/lib/types/social-media"

interface CompanyEditClientProps {
  company: Company
}

export function CompanyEditClient({ company }: CompanyEditClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<any>>({})
  const [socialMedia, setSocialMedia] = React.useState<Array<{ type: SocialMediaType; url: string }>>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  // Cargar redes sociales existentes al montar el componente
  React.useEffect(() => {
    async function loadSocialMedia() {
      if (company?.id) {
        try {
          const response = await fetch(`/api/companies/${company.id}/social-media`)
          if (response.ok) {
            const data = await response.json()
            const formatted = (data.socialMedia || [])
              .filter((sm: CompanySocialMedia) => sm.url && sm.url.trim().length > 0 && sm.is_active)
              .map((sm: CompanySocialMedia) => ({
                type: sm.type,
                url: sm.url,
              }))
            setSocialMedia(formatted)
          } else {
            // Si hay error, inicializar como array vacío
            setSocialMedia([])
          }
        } catch (error) {
          console.error("Error cargando redes sociales:", error)
          // En caso de error, inicializar como array vacío
          setSocialMedia([])
        }
      }
    }
    loadSocialMedia()
  }, [company?.id])

  const handleFormReady = React.useCallback((
    formInstance: UseFormReturn<any>,
    submitting: boolean,
    submitHandler: (data: any) => Promise<void>
  ) => {
    setForm(formInstance)
    setIsSubmitting(submitting)
    // Wrapper para el submit handler que maneja los estados de loading y éxito
    const wrappedSubmitHandler = async (data: any) => {
      setIsLoading(true)
      setIsSubmitting(true)
      setShowSuccess(false)
      try {
        await submitHandler(data)
        // Mostrar éxito y ocultar loading
        setIsLoading(false)
        setIsSubmitting(false)
        setShowSuccess(true)
        // El submitHandler ya espera 2 segundos antes de redirigir
      } catch (error) {
        setIsLoading(false)
        setIsSubmitting(false)
        setShowSuccess(false)
        throw error
      }
    }
    setOnSubmit(() => wrappedSubmitHandler)
  }, [])

  const handleFormChange = React.useCallback((values: Partial<any>) => {
    setFormValues(values)
    // Extraer redes sociales si están en los valores
    if (values.socialMedia) {
      setSocialMedia(values.socialMedia)
    }
  }, [])

  // Combinar los valores del formulario con la company original
  const displayCompany = React.useMemo(() => {
    return {
      ...company,
      name: formValues.name ?? company.name,
      legal_name: formValues.legal_name ?? company.legal_name,
      website: formValues.website ?? company.website,
      logo_url: formValues.logo_url ?? company.logo_url,
      address: formValues.address ?? company.address,
      country: formValues.country ?? company.country,
    }
  }, [company, formValues])

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
              company_id: company.id || "",
              type: sm.type,
              url: sm.url,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))}
            isLoading={isLoading}
            showSuccess={showSuccess}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <CompanyForm 
            company={company} 
            mode="edit" 
            onFormReady={handleFormReady}
            onFormChange={handleFormChange}
          />
        </div>
      </div>

      {/* Botones de acción en fila completa centrada */}
      {form && onSubmit && (
        <CompanyFormActions
          mode="edit"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

