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
import { Pencil, Trash2, UserPlus, Users, Shield, User, UserCog, IdCard, Mail, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import type { UserProfile, Company } from "@/lib/types/user"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserDocumentView } from "@/components/user-document-view"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface UsersTableProps {
  users: UserProfile[]
  companies: Company[]
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

export function UsersTable({ users, companies }: UsersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null)
  const [resendingEmailId, setResendingEmailId] = React.useState<string | null>(null)
  
  // Estados para filtros
  const [searchName, setSearchName] = React.useState("")
  const [searchEmail, setSearchEmail] = React.useState("")
  const [filterRole, setFilterRole] = React.useState<string>("all")
  const [filterCompany, setFilterCompany] = React.useState<string>("all")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(5)
  
  // Estados para ordenamiento
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

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

  // Usar companies del prop (ya viene de UsersView)

  // Filtrar usuarios
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Filtro por nombre
      if (searchName && !user.full_name?.toLowerCase().includes(searchName.toLowerCase())) {
        return false
      }

      // Filtro por email
      if (searchEmail && !user.email.toLowerCase().includes(searchEmail.toLowerCase())) {
        return false
      }

      // Filtro por rol
      if (filterRole !== "all" && user.role !== filterRole) {
        return false
      }

      // Filtro por empresa
      if (filterCompany !== "all" && user.company_id !== filterCompany) {
        return false
      }

      // Filtro por estado
      if (filterStatus !== "all") {
        const isActive = filterStatus === "active"
        if (user.is_active !== isActive) {
          return false
        }
      }

      return true
    })
  }, [users, searchName, searchEmail, filterRole, filterCompany, filterStatus])

  // Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Si ya está ordenando por esta columna, cambiar la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Si es una nueva columna, ordenar ascendente
      setSortColumn(column)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Resetear a la primera página al ordenar
  }

  // Aplicar ordenamiento a los usuarios filtrados
  const sortedUsers = React.useMemo(() => {
    if (!sortColumn) {
      return filteredUsers
    }

    const sorted = [...filteredUsers].sort((a, b) => {
      let aValue: string | number | boolean | Date
      let bValue: string | number | boolean | Date

      switch (sortColumn) {
        case "name":
          aValue = a.full_name?.toLowerCase() || a.email.toLowerCase()
          bValue = b.full_name?.toLowerCase() || b.email.toLowerCase()
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        case "company":
          aValue = a.company?.name?.toLowerCase() || ""
          bValue = b.company?.name?.toLowerCase() || ""
          break
        case "status":
          aValue = a.is_active ? 1 : 0
          bValue = b.is_active ? 1 : 0
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case "updated_at":
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [filteredUsers, sortColumn, sortDirection])

  // Calcular paginación
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambian los filtros o el ordenamiento
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchName, searchEmail, filterRole, filterCompany, filterStatus, sortColumn, sortDirection])

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchName("")
    setSearchEmail("")
    setFilterRole("all")
    setFilterCompany("all")
    setFilterStatus("all")
  }

  const hasActiveFilters = searchName || searchEmail || filterRole !== "all" || filterCompany !== "all" || filterStatus !== "all"

  // TEMPORAL: Función para reenviar correo de bienvenida
  // TODO: Eliminar esta función después de las pruebas
  const handleResendEmail = async (userId: string) => {
    setResendingEmailId(userId)
    try {
      const response = await fetch(`/api/users/${userId}/resend-email`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Error al reenviar el correo")
        return
      }

      if (data.emailSent) {
        toast.success(data.message || "Correo de bienvenida reenviado correctamente")
      } else {
        toast.warning("Correo no enviado", {
          description: data.password 
            ? `Nueva contraseña: ${data.password} - ${data.emailError || "Error desconocido"}`
            : data.emailError || "Error desconocido al enviar correo",
          duration: 10000,
        })
      }
    } catch (error) {
      console.error("Error reenviando correo:", error)
      toast.error("Error inesperado al reenviar el correo")
    } finally {
      setResendingEmailId(null)
    }
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
        <div className="h-full flex flex-col min-h-0">
          {/* Controles de filtro */}
          <div className="flex-shrink-0 mb-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filtro por nombre */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Buscar por nombre</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre del usuario..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por email */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Buscar por email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email del usuario..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por rol */}
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por empresa */}
            <div className="min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Empresa</label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div className="min-w-[120px]">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mb-0"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Información de resultados */}
          <div className="flex-shrink-0 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {paginatedUsers.length} de {sortedUsers.length} usuario{sortedUsers.length !== 1 ? 's' : ''}
              {hasActiveFilters && ` (filtrados de ${users.length} total)`}
            </span>
            <div className="flex items-center gap-2">
              <span>Mostrar:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
            <ScrollArea className="h-full w-full">
            <Table className="table-auto">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap px-2 text-center" style={{ width: '1%' }}>Documento</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort("name")}
                    >
                      Usuario
                      {sortColumn === "name" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort("role")}
                    >
                      Rol
                      {sortColumn === "role" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort("company")}
                    >
                      Empresa
                      {sortColumn === "company" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort("status")}
                    >
                      Estado
                      {sortColumn === "status" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort("created_at")}
                    >
                      Fechas
                      {sortColumn === "created_at" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="table-actions-column">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
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
                      {/* TEMPORAL: Botón para reenviar correo - TODO: Eliminar después de las pruebas */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendEmail(user.id)}
                            disabled={resendingEmailId === user.id}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Mail className="h-5 w-5 icon-hover-scale" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reenviar correo de bienvenida (temporal)</p>
                        </TooltipContent>
                      </Tooltip>
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
              })
              )}
            </TableBody>
          </Table>
            </ScrollArea>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Mostrar primera página, última página, página actual y páginas adyacentes
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          )}
        </div>
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

