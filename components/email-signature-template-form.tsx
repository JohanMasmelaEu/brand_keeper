"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  createEmailSignatureTemplateSchema,
  updateEmailSignatureTemplateSchema,
} from "@/lib/validations/schemas"
import type {
  CreateEmailSignatureTemplateFormData,
  UpdateEmailSignatureTemplateFormData,
} from "@/lib/validations/schemas"
import { useRouter } from "next/navigation"
import type { EmailSignatureTemplate } from "@/lib/types/email-signature"
import { toast } from "sonner"
import type { Company } from "@/lib/types/user"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EmailSignatureTemplateFormProps {
  template?: EmailSignatureTemplate
  mode: "create" | "edit"
  companies: Company[]
  userCompanyId: string
  userRole: "super_admin" | "admin"
  onFormReady?: (form: ReturnType<typeof useForm>, isSubmitting: boolean, onSubmit: (data: any) => Promise<void>) => void
  onFormChange?: (values: Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData>) => void
}

export function EmailSignatureTemplateForm({
  template,
  mode,
  companies,
  userCompanyId,
  userRole,
  onFormReady,
  onFormChange,
}: EmailSignatureTemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const schema =
    mode === "create"
      ? createEmailSignatureTemplateSchema
      : updateEmailSignatureTemplateSchema

  const form = useForm<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData>({
    resolver: zodResolver(schema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || "",
          template_type: template.template_type,
          html_content: template.html_content,
          is_global: template.is_global,
          is_active: template.is_active,
        }
      : {
          name: "",
          description: "",
          template_type: "simple",
          html_content: "",
          is_global: false,
          is_active: true,
          company_id: userCompanyId,
        },
  })

  // Observar cambios en el formulario para actualizar vista previa en tiempo real
  const name = form.watch("name")
  const description = form.watch("description")
  const template_type = form.watch("template_type")
  const html_content = form.watch("html_content")
  const is_global = form.watch("is_global")
  const is_active = form.watch("is_active")
  const company_id = form.watch("company_id")

  const previousValuesRef = React.useRef<string>("")

  React.useEffect(() => {
    if (!onFormChange) return

    const currentValues = {
      name,
      description,
      template_type,
      html_content,
      is_global,
      is_active,
      company_id,
    }

    // Serializar valores para comparación
    const currentValuesStr = JSON.stringify(currentValues)

    // Solo actualizar si los valores realmente cambiaron
    if (currentValuesStr !== previousValuesRef.current) {
      previousValuesRef.current = currentValuesStr
      onFormChange(currentValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, template_type, html_content, is_global, is_active, company_id])

  // Determinar qué empresas puede seleccionar el usuario
  const availableCompanies = React.useMemo(() => {
    if (userRole === "super_admin") {
      return companies
    }
    // Admin solo puede seleccionar su empresa
    return companies.filter((c) => c.id === userCompanyId)
  }, [companies, userCompanyId, userRole])

  // Determinar si puede crear plantillas globales
  const canCreateGlobal = React.useMemo(() => {
    if (userRole !== "super_admin") return false
    const selectedCompanyId = form.watch("company_id") || userCompanyId
    const selectedCompany = companies.find((c) => c.id === selectedCompanyId)
    return selectedCompany?.is_parent ?? false
  }, [userRole, companies, userCompanyId, form])

  const onSubmit = async (
    data: CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData
  ) => {
    setIsSubmitting(true)
    try {
      if (mode === "create") {
        const createData = {
          ...(data as CreateEmailSignatureTemplateFormData),
          company_id: form.getValues("company_id") || userCompanyId,
        } as CreateEmailSignatureTemplateFormData

        const response = await fetch("/api/email-signatures", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Error al crear la plantilla")
        }

        toast.success("Plantilla creada correctamente")
        router.push("/dashboard/email-signatures")
        router.refresh()
      } else {
        const updateData = data as UpdateEmailSignatureTemplateFormData
        const response = await fetch(`/api/email-signatures/${template!.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Error al actualizar la plantilla")
        }

        toast.success("Plantilla actualizada correctamente")
        
        // Si es modo edición, esperar 2 segundos antes de redirigir para mostrar la animación de éxito
        if (mode === "edit") {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        router.push("/dashboard/email-signatures")
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(
        error instanceof Error ? error.message : "Error al guardar la plantilla"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(form, isSubmitting, onSubmit)
    }
  }, [form, isSubmitting, onFormReady])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === "create" && (
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || userCompanyId}
                  disabled={userRole === "admin"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {userRole === "admin"
                    ? "Solo puedes crear plantillas para tu empresa"
                    : "Selecciona la empresa para la que crearás la plantilla"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Row 1: Nombre, Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la plantilla</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Plantilla Simple Corporativa" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo para identificar la plantilla
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="template_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de plantilla</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="with_photo">Con Foto</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo de diseño de la plantilla de firma
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Textarea
                        placeholder="Descripción de la plantilla..."
                        rows={1}
                        className={cn(
                          "resize-none !min-h-[2.5rem] !h-10 overflow-hidden",
                          field.value && field.value.length > 0 && "cursor-pointer"
                        )}
                        style={{ 
                          minHeight: '2.5rem',
                          height: '2.5rem',
                          lineHeight: '1.25rem'
                        }}
                        {...field}
                        value={field.value || ""}
                      />
                    </TooltipTrigger>
                    {field.value && field.value.trim().length > 0 && (
                      <TooltipContent side="top" className="max-w-md">
                        <p className="whitespace-pre-wrap break-words">{field.value}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </FormControl>
              <FormDescription>
                Descripción opcional de la plantilla y su uso
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 3: Contenido HTML */}
        <FormField
          control={form.control}
          name="html_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido HTML</FormLabel>
              <FormControl>
                <div className="flex items-center gap-0 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-md focus-within:outline-none">
                  <Textarea
                    placeholder='<table>...</table>'
                    className={cn(
                      "font-mono text-sm min-h-[300px] rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0",
                      field.value && field.value.length > 0 && "cursor-text"
                    )}
                    {...field}
                  />
                  {field.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-auto w-10 rounded-l-none border-l-0 shrink-0 self-start mt-2"
                      onClick={() => {
                        field.onChange("")
                      }}
                      title="Limpiar campo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                HTML de la plantilla. Usa variables como {"{"}full_name{"}"}, {"{"}position{"}"}, {"{"}phone{"}"}, {"{"}email{"}"}, {"{"}website{"}"}, {"{"}company_name{"}"}, {"{"}company_logo{"}"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 4: Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mode === "create" && canCreateGlobal && (
            <FormField
              control={form.control}
              name="is_global"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Plantilla Global</FormLabel>
                    <FormDescription>
                      Si está activado, esta plantilla será visible para todas las empresas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activa</FormLabel>
                  <FormDescription>
                    Si está desactivada, la plantilla no estará disponible para uso
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
