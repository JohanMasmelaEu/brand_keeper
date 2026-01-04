"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { emailSignatureFormSchema } from "@/lib/validations/schemas"
import type { EmailSignatureFormFormData } from "@/lib/validations/schemas"
import type { EmailSignatureTemplate, CompanyBrandData } from "@/lib/types/email-signature"
import { toast } from "sonner"
import { Copy, Download, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EmailSignatureGeneratorProps {
  templates: EmailSignatureTemplate[]
  companyBrand: CompanyBrandData
  userEmail: string
  userFullName?: string | null
}

export function EmailSignatureGenerator({
  templates,
  companyBrand,
  userEmail,
  userFullName,
}: EmailSignatureGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailSignatureTemplate | null>(
    templates[0] || null
  )
  const [generatedHtml, setGeneratedHtml] = React.useState<string>("")
  const [isCopying, setIsCopying] = React.useState(false)

  const form = useForm<EmailSignatureFormFormData>({
    resolver: zodResolver(emailSignatureFormSchema),
    defaultValues: {
      template_id: templates[0]?.id || "",
      full_name: userFullName || "",
      position: "",
      phone: "",
      phone_extension: "",
      email: userEmail,
      website: companyBrand.website || "",
      photo_url: "",
    },
  })

  // Observar cambios en el formulario y template para generar HTML
  const formValues = form.watch()
  const templateId = form.watch("template_id")

  React.useEffect(() => {
    const template = templates.find((t) => t.id === templateId)
    setSelectedTemplate(template || null)
    if (template) {
      form.setValue("template_id", template.id)
    }
  }, [templateId, templates, form])

  React.useEffect(() => {
    if (selectedTemplate && formValues) {
      generateSignatureHtml(selectedTemplate, formValues)
    }
  }, [selectedTemplate, formValues])

  const generateSignatureHtml = (
    template: EmailSignatureTemplate,
    values: EmailSignatureFormFormData
  ) => {
    let html = template.html_content

    // Reemplazar variables en el HTML
    const replacements: Record<string, string> = {
      "{full_name}": values.full_name || "",
      "{position}": values.position || "",
      "{phone}": values.phone || "",
      "{phone_extension}": values.phone_extension
        ? ` ext. ${values.phone_extension}`
        : "",
      "{email}": values.email || "",
      "{website}": values.website || companyBrand.website || "",
      "{company_name}": companyBrand.name || "",
      "{company_logo}": companyBrand.logo_url || "",
      "{photo_url}": values.photo_url || "",
    }

    // Reemplazar todas las variables
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value)
    })

    // Limpiar variables no reemplazadas
    html = html.replace(/\{[^}]+\}/g, "")

    setGeneratedHtml(html)
  }

  const handleCopyToClipboard = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(generatedHtml)
      toast.success("HTML copiado al portapapeles")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error("Error al copiar al portapapeles")
    } finally {
      setIsCopying(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `firma-${formValues.full_name || "firma"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Archivo descargado")
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No hay plantillas disponibles para generar firmas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Formulario</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Firma</CardTitle>
              <CardDescription>
                Completa los datos para generar tu firma de correo personalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plantilla</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una plantilla" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecciona el diseño de la plantilla
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Gerente de Ventas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_extension"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extensión (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="juan@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.empresa.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Si se deja vacío, se usará el sitio web de la empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTemplate?.template_type === "with_photo" && (
                    <FormField
                      control={form.control}
                      name="photo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Foto (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormDescription>
                            URL de tu foto de perfil para la firma
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>
                    Así se verá tu firma de correo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    disabled={!generatedHtml || isCopying}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {isCopying ? "Copiando..." : "Copiar HTML"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!generatedHtml}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div
                  dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  className="signature-preview"
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

