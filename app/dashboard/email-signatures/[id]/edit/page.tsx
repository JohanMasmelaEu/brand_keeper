import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { getEmailSignatureTemplateById } from "@/lib/supabase/email-signature"
import { EmailSignatureTemplateEditClient } from "./email-signature-template-edit-client"
import { FormSkeleton } from "@/components/page-skeleton"

async function EditEmailSignatureTemplateContent({
  templateId,
}: {
  templateId: string
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Obtener plantilla
  const template = await getEmailSignatureTemplateById(templateId)

  if (!template) {
    redirect("/dashboard/email-signatures")
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
          Editar Plantilla
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          {template.name}
        </p>
      </div>

      <EmailSignatureTemplateEditClient
        template={template}
        companies={companies}
        userCompanyId={profile.company_id}
        userRole={profile.role}
      />
    </div>
  )
}

export default async function EditEmailSignatureTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
      <EditEmailSignatureTemplateContent templateId={id} />
    </Suspense>
  )
}

