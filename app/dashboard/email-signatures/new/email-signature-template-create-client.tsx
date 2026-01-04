"use client"

import * as React from "react"
import { EmailSignatureTemplateForm } from "@/components/email-signature-template-form"
import { EmailSignatureTemplateFormActions } from "@/components/email-signature-template-form-actions"
import { EmailSignatureTemplatePreview } from "@/components/email-signature-template-preview"
import type { Company } from "@/lib/types/user"
import type { UserRole } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"
import type {
  CreateEmailSignatureTemplateFormData,
  UpdateEmailSignatureTemplateFormData,
} from "@/lib/validations/schemas"

interface EmailSignatureTemplateCreateClientProps {
  companies: Company[]
  userCompanyId: string
  userRole: UserRole
}

export function EmailSignatureTemplateCreateClient({
  companies,
  userCompanyId,
  userRole,
}: EmailSignatureTemplateCreateClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData> & { company_id?: string }>({})

  // Obtener la empresa seleccionada para la vista previa
  const selectedCompanyId = formValues.company_id || userCompanyId
  const selectedCompany = React.useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0] || null
  }, [companies, selectedCompanyId])

  const handleFormReady = React.useCallback((
    formInstance: UseFormReturn<any>,
    submitting: boolean,
    submitHandler: (data: any) => Promise<void>
  ) => {
    setForm(formInstance)
    setIsSubmitting(submitting)
    setOnSubmit(() => submitHandler)
  }, [])

  const handleFormChange = React.useCallback((values: Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData> & { company_id?: string }) => {
    setFormValues(values)
  }, [])

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
            formValues={formValues}
            company={selectedCompany}
            isCreating={true}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <EmailSignatureTemplateForm
            mode="create"
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
          mode="create"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}
