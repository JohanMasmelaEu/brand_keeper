"use client"

import * as React from "react"
import { EmailSignatureTemplateForm } from "@/components/email-signature-template-form"
import { EmailSignatureTemplateFormActions } from "@/components/email-signature-template-form-actions"
import { EmailSignatureTemplatePreview } from "@/components/email-signature-template-preview"
import type { EmailSignatureTemplate } from "@/lib/types/email-signature"
import type { Company } from "@/lib/types/user"
import type { UserRole } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"
import type {
  CreateEmailSignatureTemplateFormData,
  UpdateEmailSignatureTemplateFormData,
} from "@/lib/validations/schemas"

interface EmailSignatureTemplateEditClientProps {
  template: EmailSignatureTemplate
  companies: Company[]
  userCompanyId: string
  userRole: UserRole
}

export function EmailSignatureTemplateEditClient({
  template,
  companies,
  userCompanyId,
  userRole,
}: EmailSignatureTemplateEditClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  // Obtener la empresa de la plantilla para la vista previa
  const templateCompany = React.useMemo(() => {
    return companies.find((c) => c.id === template.company_id) || null
  }, [companies, template.company_id])

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

  const handleFormChange = React.useCallback((values: Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData>) => {
    setFormValues(values)
  }, [])

  // Combinar los valores del formulario con la plantilla original
  const displayTemplate = React.useMemo(() => {
    return {
      ...template,
      name: formValues.name ?? template.name,
      description: formValues.description ?? template.description,
      template_type: formValues.template_type ?? template.template_type,
      html_content: formValues.html_content ?? template.html_content,
      is_global: formValues.is_global ?? template.is_global,
      is_active: formValues.is_active ?? template.is_active,
    }
  }, [template, formValues])

  if (userRole !== "super_admin" && userRole !== "admin") {
    return null
  }

  return (
    <>
      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Vista previa */}
        <div className="w-full relative">
          <EmailSignatureTemplatePreview
            template={displayTemplate}
            formValues={formValues}
            company={templateCompany}
            isLoading={isLoading}
            showSuccess={showSuccess}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <EmailSignatureTemplateForm
            template={template}
            mode="edit"
            companies={companies}
            userCompanyId={userCompanyId}
            userRole={userRole}
            onFormReady={handleFormReady}
            onFormChange={handleFormChange}
          />
        </div>
      </div>

      {/* Botones de acción en fila completa centrada */}
      {form && onSubmit && (
        <EmailSignatureTemplateFormActions
          mode="edit"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}
