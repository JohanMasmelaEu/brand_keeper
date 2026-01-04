"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Company } from "@/lib/types/user"
import { CompaniesTable } from "@/components/companies-table"
import { Card, CardContent } from "@/components/ui/card"

interface CompaniesViewProps {
  companies: Company[]
}

export function CompaniesView({ companies }: CompaniesViewProps) {
  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
              Gestión de Empresas
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              Administra empresas matriz e hijas
            </p>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/companies/new">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Empresa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Card con tabla de empresas */}
      <div suppressHydrationWarning>
        <Card className="w-full shadow-lg">
          <CardContent className="p-6">
            <CompaniesTable companies={companies} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

