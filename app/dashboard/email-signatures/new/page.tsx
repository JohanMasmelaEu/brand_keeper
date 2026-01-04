import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { EmailSignatureTemplateCreateClient } from "./email-signature-template-create-client"
import { FormSkeleton } from "@/components/page-skeleton"

async function NewEmailSignatureTemplateContent() {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect("/login")
  }

  // Obtener empresas disponibles
  let companies = []
  if (profile.role === "super_admin") {
    companies = await getAllCompanies()
  } else {
    // Admin solo necesita su empresa
    companies = profile.company ? [profile.company] : []
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Nueva Plantilla de Firma
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Crea una nueva plantilla de firma de correo
        </p>
      </div>

      <EmailSignatureTemplateCreateClient 
        companies={companies}
        userCompanyId={profile.company_id}
        userRole={profile.role}
      />
    </div>
  )
}

export default async function NewEmailSignatureTemplatePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo super_admin y admin pueden acceder
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewEmailSignatureTemplateContent />
    </Suspense>
  )
}

