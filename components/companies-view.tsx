"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Table2, Network } from "lucide-react"
import Link from "next/link"
import type { Company } from "@/lib/types/user"
import { CompaniesTable } from "@/components/companies-table"
import { CompaniesOrgChart } from "@/components/companies-org-chart"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CompaniesViewProps {
  companies: Company[]
}

type ViewMode = "table" | "org-chart"

export function CompaniesView({ companies }: CompaniesViewProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("org-chart")

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
              Gestión de Empresas
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              Administra empresas matriz e hijas
            </p>
          </div>
          {/* Toggle de vista - centrado */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
              <Button
                variant={viewMode === "org-chart" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("org-chart")}
                className="h-8"
              >
                <Network className="h-4 w-4 mr-2" />
                Organigrama
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <Table2 className="h-4 w-4 mr-2" />
                Tabla
              </Button>
            </div>
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

      {/* Card con contenido del tab seleccionado */}
      <div suppressHydrationWarning>
        <Card className="w-full shadow-lg">
          <CardContent className="p-0">
            {/* Contenedor único: siempre renderizado igual */}
            <div 
              className={`${viewMode === "org-chart" ? "p-4" : "p-6"} overflow-auto`}
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                height: 'calc(100vh - 280px)'
              }}
            >
              {viewMode === "org-chart" ? (
                <CompaniesOrgChart companies={companies} />
              ) : (
                <CompaniesTable companies={companies} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

