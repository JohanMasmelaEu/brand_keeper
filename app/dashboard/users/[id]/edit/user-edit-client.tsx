"use client"

import * as React from "react"
import { UserForm } from "@/components/user-form"
import { UserFormActions } from "@/components/user-form-actions"
import { UserDocumentView } from "@/components/user-document-view"
import type { Company } from "@/lib/types/user"
import type { UserProfile } from "@/lib/types/user"
import type { UseFormReturn } from "react-hook-form"

interface UserEditClientProps {
  user: UserProfile
  companies: Company[]
}

export function UserEditClient({ user, companies }: UserEditClientProps) {
  const [form, setForm] = React.useState<UseFormReturn<any> | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [onSubmit, setOnSubmit] = React.useState<((data: any) => Promise<void>) | null>(null)
  const [formValues, setFormValues] = React.useState<Partial<any>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null)

  // Cargar empresa del usuario al montar
  React.useEffect(() => {
    if (user.company_id) {
      const company = companies.find(c => c.id === user.company_id)
      setSelectedCompany(company || null)
    }
  }, [user.company_id, companies])

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
    // Encontrar la empresa seleccionada
    if (values.company_id) {
      const company = companies.find(c => c.id === values.company_id)
      setSelectedCompany(company || null)
    } else if (values.company_id === "") {
      setSelectedCompany(null)
    }
  }, [companies])

  // Combinar los valores del formulario con el usuario original
  const displayUser = React.useMemo(() => {
    return {
      ...user,
      email: formValues.email ?? user.email,
      full_name: formValues.full_name ?? user.full_name,
      role: formValues.role ?? user.role,
      company_id: formValues.company_id ?? user.company_id,
      avatar_url: formValues.avatar_url ?? user.avatar_url,
      is_active: formValues.is_active !== undefined ? formValues.is_active : user.is_active,
    }
  }, [user, formValues])

  return (
    <>
      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Columna izquierda: Visualización tipo documento */}
        <div className="w-full relative">
          <UserDocumentView 
            user={displayUser} 
            company={selectedCompany}
            isLoading={isLoading}
            showSuccess={showSuccess}
          />
        </div>

        {/* Columna derecha: Formulario */}
        <div className="w-full">
          <UserForm 
            user={user} 
            mode="edit" 
            companies={companies}
            onFormReady={handleFormReady}
            onFormChange={handleFormChange}
          />
        </div>
      </div>

      {/* Botones de acción en fila completa centrada */}
      {form && onSubmit && (
        <UserFormActions
          mode="edit"
          isSubmitting={isSubmitting}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    </>
  )
}

