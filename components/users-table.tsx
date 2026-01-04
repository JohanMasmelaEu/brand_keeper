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
import { Pencil, Trash2, UserPlus, Users, Shield, User, UserCog, IdCard } from "lucide-react"
import Link from "next/link"
import type { UserProfile } from "@/lib/types/user"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserDocumentView } from "@/components/user-document-view"

interface UsersTableProps {
  users: UserProfile[]
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  collaborator: "Colaborador",
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  super_admin: Shield,
  admin: UserCog,
  collaborator: User,
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null)

  const handleDelete = async (userId: string) => {
    setDeletingId(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Error al desactivar el usuario")
        return
      }

      toast.success("Usuario desactivado correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error desactivando usuario:", error)
      toast.error("Error inesperado al desactivar el usuario")
    } finally {
      setDeletingId(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Comienza creando tu primer usuario
        </p>
        <Link href="/dashboard/users/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
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
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead className="table-actions-column">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role] || User
                return (
                  <TableRow key={user.id}>
                    <TableCell className="px-2 text-center" style={{ width: '1%' }}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
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
                    <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                        <AvatarFallback>
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.full_name || "Sin nombre"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.company?.name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-500">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-left">
                      <div className="flex items-start">
                        <span className="text-muted-foreground text-xs min-w-[75px]">Creado:</span>
                        <span className="text-foreground">
                          {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-muted-foreground text-xs min-w-[75px]">Actualizado:</span>
                        <span className="text-foreground">
                          {format(new Date(user.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="table-actions-column">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/dashboard/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-5 w-5 icon-hover-scale" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar usuario</p>
                        </TooltipContent>
                      </Tooltip>
                      {user.is_active && (
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === user.id}
                                >
                                  <Trash2 className="h-5 w-5 text-destructive icon-hover-scale" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Desactivar usuario</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Desactivar usuario?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción desactivará el usuario{" "}
                                <strong>{user.full_name || user.email}</strong>.
                                El usuario no podrá iniciar sesión hasta que sea reactivado.
                                Esta acción no elimina el usuario permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Desactivar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal del documento de presentación */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Documento de Presentación</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-4">
              <UserDocumentView user={selectedUser} company={selectedUser.company || null} />
            </div>
          )}
        </DialogContent>
      </Dialog>
      </TooltipProvider>
    </>
  )
}

