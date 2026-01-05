"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UseFormReturn } from "react-hook-form"

interface BrandSettingsFormActionsProps {
  mode: "create" | "edit"
  isSubmitting: boolean
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void>
}

export function BrandSettingsFormActions({
  mode,
  isSubmitting,
  form,
  onSubmit,
}: BrandSettingsFormActionsProps) {
  const router = useRouter()

  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <div className="flex gap-3 justify-center mt-12">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/dashboard/brand-settings")}
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
            {isSubmitting ? "Creando..." : "Crear Configuración"}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Actualizando..." : "Actualizar Configuración"}
          </>
        )}
      </Button>
    </div>
  )
}

