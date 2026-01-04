"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import type { UserProfile, Company } from "@/lib/types/user"
import { UsersTable } from "@/components/users-table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

interface UsersViewProps {
  users: UserProfile[]
  companies: Company[]
}

export function UsersView({ users, companies }: UsersViewProps) {
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>("all")

  // Filtrar usuarios por empresa seleccionada
  const filteredUsers = React.useMemo(() => {
    if (selectedCompanyId === "all") {
      return users
    }
    return users.filter((user) => user.company_id === selectedCompanyId)
  }, [users, selectedCompanyId])

  // Obtener la empresa seleccionada para mostrar su logo
  const selectedCompany = React.useMemo(() => {
    if (selectedCompanyId === "all") {
      return null
    }
    const company = companies.find((company) => company.id === selectedCompanyId) || null
    // Debug: verificar que la empresa tiene logo_url
    if (company && company.logo_url) {
      console.log("Company logo URL:", company.logo_url)
    }
    return company
  }, [companies, selectedCompanyId])

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Header fijo */}
      <div className="flex-shrink-0 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
              Gestión de Usuarios
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              Administra usuarios y permisos del sistema
            </p>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/users/new">
              <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Select de empresas - centrado horizontalmente */}
      <div className="flex-shrink-0 mb-6 flex justify-center">
        <div className="w-full max-w-md">
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar empresa..." />
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
      </div>

      {/* Logo de la empresa seleccionada */}
      {selectedCompany && (
        <div className="flex-shrink-0 mb-6 flex justify-center">
          <div className="h-20 min-h-20 flex items-center justify-center">
            {selectedCompany.logo_url ? (
              <Image
                src={selectedCompany.logo_url}
                alt={selectedCompany.name}
                width={0}
                height={80}
                className="h-full w-auto max-w-xs object-contain"
                unoptimized={selectedCompany.logo_url.startsWith("http")}
                onError={(e) => {
                  console.error("Error loading company logo:", selectedCompany.logo_url)
                }}
                onLoad={() => {
                  console.log("Company logo loaded successfully:", selectedCompany.logo_url)
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground px-4">
                <span className="text-lg font-semibold">{selectedCompany.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card con tabla de usuarios - ocupa el espacio restante */}
      <div suppressHydrationWarning className="flex-1 min-h-0 flex flex-col">
        <Card className="w-full shadow-lg flex-1 flex flex-col min-h-0 overflow-hidden">
          <CardContent className="p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <UsersTable users={filteredUsers} companies={companies} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

