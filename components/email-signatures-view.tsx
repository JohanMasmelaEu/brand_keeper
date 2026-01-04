"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { EmailSignatureTemplate } from "@/lib/types/email-signature"
import { EmailSignaturesTable } from "@/components/email-signatures-table"
import { Card, CardContent } from "@/components/ui/card"

interface EmailSignaturesViewProps {
  templates: EmailSignatureTemplate[]
}

export function EmailSignaturesView({ templates }: EmailSignaturesViewProps) {
  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
              Plantillas de Firma
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              Administra las plantillas de firma de correo
            </p>
          </div>
          <div className="flex justify-end">
            <Link href="/dashboard/email-signatures/new">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Card con tabla de plantillas */}
      <div suppressHydrationWarning>
        <Card className="w-full shadow-lg">
          <CardContent className="p-6">
            <EmailSignaturesTable templates={templates} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

