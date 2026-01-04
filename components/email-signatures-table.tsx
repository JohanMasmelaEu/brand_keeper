"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Eye, Globe, Building2 } from "lucide-react"
import type { EmailSignatureTemplate } from "@/lib/types/email-signature"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EmailSignaturesTableProps {
  templates: EmailSignatureTemplate[]
}

const templateTypeLabels: Record<string, string> = {
  simple: "Simple",
  with_photo: "Con Foto",
  vertical: "Vertical",
}

export function EmailSignaturesTable({ templates }: EmailSignaturesTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleDelete = async (templateId: string) => {
    setDeletingId(templateId)
    try {
      const response = await fetch(`/api/email-signatures/${templateId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la plantilla")
      }

      toast.success("Plantilla eliminada correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error eliminando plantilla:", error)
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar la plantilla"
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewPreview = (template: EmailSignatureTemplate) => {
    // Abrir preview en nueva ventana
    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(template.html_content)
      previewWindow.document.close()
    }
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay plantillas disponibles</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Alcance</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {templateTypeLabels[template.template_type] || template.template_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {template.is_global ? (
                    <>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Global</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{template.company?.name || "N/A"}</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell>
                {template.is_global ? (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Global
                  </Badge>
                ) : (
                  <Badge variant="outline">Empresa</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vista previa</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/email-signatures/${template.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === template.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La plantilla "{template.name}" será
                          eliminada permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

