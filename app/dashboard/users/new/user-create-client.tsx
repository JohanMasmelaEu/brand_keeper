"use client"

import * as React from "react"
import { UserForm } from "@/components/user-form"
import { UserFormActions } from "@/components/user-form-actions"
import { UserDocumentView } from "@/components/user-document-view"
import type { Company } from "@/lib/types/user"
import type { UserProfile } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"

interface UserCreateClientProps {
  companies: Company[]
}

export function UserCreateClient({ companies }: UserCreateClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<any>>({})
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null)

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
    // Encontrar la empresa seleccionada
    if (values.company_id) {
      const company = companies.find(c => c.id === values.company_id)
      setSelectedCompany(company || null)
    } else {
      setSelectedCompany(null)
    }
  }, [companies])

  // Crear un objeto UserProfile con placeholders para mostrar en el documento
  const displayUser = React.useMemo((): UserProfile => {
    const now = new Date().toISOString()
    return {
      id: "placeholder-id",
      email: formValues.email || "Correo Electrónico",
      full_name: formValues.full_name || null,
      role: (formValues.role as UserProfile["role"]) || "collaborator",
      company_id: formValues.company_id || "",
      avatar_url: formValues.avatar_url || null,
      is_active: true,
      created_at: now,
      updated_at: now,
    }
  }, [formValues])

  return (
    <>
      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Columna izquierda: Visualización tipo documento */}
        <div className="w-full relative">
          <UserDocumentView 
            user={displayUser} 
            company={selectedCompany}
            isLoading={false}
            showSuccess={false}
            isCreating={true}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <UserForm 
            mode="create" 
            companies={companies}
            onFormReady={handleFormReady}
            onFormChange={handleFormChange}
          />
        </div>
      </div>

      {/* Botones de acción en fila completa centrada */}
      {form && onSubmit && (
        <UserFormActions
          mode="create"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

