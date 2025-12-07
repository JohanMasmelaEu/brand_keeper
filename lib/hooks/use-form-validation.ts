/**
 * Hook personalizado para manejar formularios con React Hook Form y Zod
 * Proporciona una interfaz consistente para todos los formularios de la aplicación
 */

import { useForm, UseFormProps, UseFormReturn, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

// Restricción: solo aceptamos schemas que produzcan objetos (FieldValues)
// Esto asegura compatibilidad con React Hook Form
export interface UseFormValidationOptions<T extends z.ZodObject<any>> {
  schema: T
  defaultValues?: UseFormProps<z.infer<T>>["defaultValues"]
  onSubmit: (data: z.infer<T>) => Promise<void> | void
  onError?: (error: unknown) => void
}

export interface FormValidationResult<T extends z.ZodObject<any>> {
  form: UseFormReturn<z.infer<T>>
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  error: string | null
  setError: (error: string | null) => void
}

/**
 * Hook reutilizable para formularios con validación
 * 
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email("Email inválido"),
 *   password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
 * })
 * 
 * const { form, onSubmit, isSubmitting, error } = useFormValidation({
 *   schema: loginSchema,
 *   defaultValues: { email: "", password: "" },
 *   onSubmit: async (data) => {
 *     // Lógica de envío
 *   },
 * })
 * ```
 */
export function useFormValidation<T extends z.ZodObject<any>>({
  schema,
  defaultValues,
  onSubmit,
  onError,
}: UseFormValidationOptions<T>): FormValidationResult<T> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema) as any,
    defaultValues,
    mode: "onChange", // Validar mientras el usuario escribe
  })

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const isValid = await form.trigger()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      const data = form.getValues()
      await onSubmit(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado. Por favor, intenta nuevamente."

      setError(errorMessage)
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      })

      if (onError) {
        onError(err)
      } else if (process.env.NODE_ENV === "development") {
        console.error("Form error:", err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    onSubmit: handleSubmit,
    isSubmitting,
    error,
    setError,
  }
}

