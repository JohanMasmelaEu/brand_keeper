"use client"

import * as React from "react"
import { CompanyForm } from "@/components/company-form"
import { CompanyFormActions } from "@/components/company-form-actions"
import { CompanyDocumentView } from "@/components/company-document-view"
import type { Company } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"

interface CompanyEditClientProps {
  company: Company
}

export function CompanyEditClient({ company }: CompanyEditClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<any>>({})

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
        <div className="w-full">
          <CompanyDocumentView company={displayCompany} />
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

