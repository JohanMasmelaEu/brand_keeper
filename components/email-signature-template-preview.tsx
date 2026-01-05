"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, FileText, Globe, Building2, CheckCircle2 } from "lucide-react"
import { CheckSealAnimation } from "@/components/check-seal-animation"
import { applyGoogleFontToHtml } from "@/components/google-font-selector"
import type {
  CreateEmailSignatureTemplateFormData,
  UpdateEmailSignatureTemplateFormData,
} from "@/lib/validations/schemas"
import type { EmailSignatureTemplate } from "@/lib/types/email-signature"
import type { Company } from "@/lib/types/user"

interface EmailSignatureTemplatePreviewProps {
  template?: EmailSignatureTemplate | null
  formValues?: Partial<CreateEmailSignatureTemplateFormData | UpdateEmailSignatureTemplateFormData>
  company?: Company | null
  isLoading?: boolean
  showSuccess?: boolean
  isCreating?: boolean
}

export function EmailSignatureTemplatePreview({
  template,
  formValues,
  company,
  isLoading = false,
  showSuccess = false,
  isCreating = false,
}: EmailSignatureTemplatePreviewProps) {
  // Generar HTML de preview con valores del formulario
  const previewHtml = React.useMemo(() => {
    if (!formValues?.html_content && !template?.html_content) {
      return ""
    }

    let html = formValues?.html_content || template?.html_content || ""

    // Reemplazar variables con valores de ejemplo o del formulario
    const replacements: Record<string, string> = {
      "{full_name}": "Juan Pérez",
      "{position}": "Gerente de Ventas",
      "{phone}": "+1 234 567 8900",
      "{phone_extension}": " ext. 123",
      "{email}": "juan.perez@empresa.com",
      "{website}": company?.website || "https://www.empresa.com",
      "{company_name}": company?.name || "Nombre de la Empresa",
      "{company_logo}": company?.logo_url || "",
      "{photo_url}": "",
    }

    // Reemplazar todas las variables
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value)
    })

    // Limpiar variables no reemplazadas
    html = html.replace(/\{[^}]+\}/g, "")

    // Aplicar Google Font si está configurada
    const googleFont = formValues?.google_font || template?.google_font
    if (googleFont && googleFont.trim() !== "") {
      html = applyGoogleFontToHtml(html, googleFont)
    }

    return html
  }, [formValues, template, company])

  // Determinar el nombre a mostrar
  const displayName = React.useMemo(() => {
    if (formValues?.name) return formValues.name
    if (template?.name) return template.name
    return "Nueva Plantilla"
  }, [formValues?.name, template?.name])

  // Determinar el tipo a mostrar
  const displayType = React.useMemo(() => {
    const type = formValues?.template_type || template?.template_type
    const typeLabels: Record<string, string> = {
      simple: "Simple",
      with_photo: "Con Foto",
      vertical: "Vertical",
    }
    return typeLabels[type || "simple"] || "Simple"
  }, [formValues?.template_type, template?.template_type])

  return (
    <Card className="w-full h-full shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Vista Previa</CardTitle>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {showSuccess && !isLoading && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
        <CardDescription>
          {isCreating ? "Vista previa de la nueva plantilla" : "Vista previa de la plantilla"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de la plantilla */}
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nombre:</span>
            <span className="text-sm text-muted-foreground">{displayName || "Sin nombre"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tipo:</span>
            <span className="text-sm text-muted-foreground">{displayType}</span>
          </div>
          {company && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Empresa:</span>
              <div className="flex items-center gap-2">
                {template?.is_global ? (
                  <>
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Global</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{company.name}</span>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <span className="text-sm text-muted-foreground">
              {formValues?.is_active !== undefined
                ? formValues.is_active
                  ? "Activa"
                  : "Inactiva"
                : template?.is_active
                ? "Activa"
                : "Inactiva"}
            </span>
          </div>
        </div>

        {/* Vista previa del HTML */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Vista Previa HTML:</span>
          </div>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-white">
            {previewHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="signature-preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">Ingresa el contenido HTML para ver la vista previa</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Animación de éxito */}
        {showSuccess && <CheckSealAnimation />}
      </CardContent>
    </Card>
  )
}

