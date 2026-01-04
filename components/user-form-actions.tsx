"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UseFormReturn } from "react-hook-form"

interface UserFormActionsProps {
  mode: "create" | "edit"
  isSubmitting: boolean
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void>
}

export function UserFormActions({ mode, isSubmitting, form, onSubmit }: UserFormActionsProps) {
  const router = useRouter()

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <div className="flex gap-3 justify-center mt-12">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/dashboard/users")}
        disabled={isSubmitting}
        className="font-bold"
      >
        <X className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="font-bold">
        {mode === "create" ? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creando..." : "Crear Usuario"}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Actualizando..." : "Actualizar Usuario"}
          </>
        )}
      </Button>
    </div>
  )
}

