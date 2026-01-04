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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pencil, Trash2, Building2, Plus, IdCard } from "lucide-react"
import Link from "next/link"
import type { Company } from "@/lib/types/user"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CompanyDocumentView } from "@/components/company-document-view"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CompaniesTableProps {
  companies: Company[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null)

  const handleDelete = async (companyId: string) => {
    setDeletingId(companyId)
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Error al eliminar la empresa")
        return
      }

      toast.success("Empresa eliminada correctamente")
      // Recargar la página para actualizar la lista
      router.refresh()
    } catch (error) {
      console.error("Error eliminando empresa:", error)
      toast.error("Error inesperado al eliminar la empresa")
    } finally {
      setDeletingId(null)
    }
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay empresas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comienza creando tu primera empresa hija
        </p>
        <Link href="/dashboard/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <TooltipProvider>
        <div className="rounded-md border">
        <Table className="table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap px-2 text-center" style={{ width: '1%' }}>Documento</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sitio Web</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead className="table-actions-column">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="px-2 text-center" style={{ width: '1%' }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCompany(company)}
                        className="h-9 w-9 p-0"
                        aria-label="Ver documento de presentación"
                      >
                        <IdCard className="h-5 w-5 icon-hover" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver documento de presentación</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>
                {company.is_parent ? (
                  <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-secondary">
                    Matriz
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-secondary">
                    Hija
                  </span>
                )}
              </TableCell>
              <TableCell>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success hover:text-success/80 hover:underline text-sm font-medium"
                  >
                    {company.website}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {company.country ? (
                  <span className="text-sm">{company.country}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm text-left">
                  <div className="flex items-start">
                    <span className="text-muted-foreground text-xs min-w-[75px]">Creado:</span>
                    <span className="text-foreground">
                      {format(new Date(company.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-muted-foreground text-xs min-w-[75px]">Actualizado:</span>
                    <span className="text-foreground">
                      {format(new Date(company.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="table-actions-column">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/dashboard/companies/${company.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-5 w-5 icon-hover-scale" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar empresa</p>
                    </TooltipContent>
                  </Tooltip>
                  {!company.is_parent && (
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === company.id}
                            >
                              <Trash2 className="h-5 w-5 text-destructive icon-hover-scale" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar empresa</p>
                        </TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar empresa?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La empresa{" "}
                            <strong>{company.name}</strong> será eliminada
                            permanentemente. Solo puedes eliminar empresas que
                            no tengan usuarios asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(company.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Modal del documento de presentación */}
    <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Documento de Presentación</DialogTitle>
        </DialogHeader>
        {selectedCompany && (
          <div className="mt-4">
            <CompanyDocumentView company={selectedCompany} />
          </div>
        )}
      </DialogContent>
    </Dialog>
      </TooltipProvider>
    </>
  )
}

