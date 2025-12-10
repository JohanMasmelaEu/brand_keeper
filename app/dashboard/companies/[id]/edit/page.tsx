import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getCompanyById } from "@/lib/supabase/company"
import { CompanyEditClient } from "./company-edit-client"
import { FormSkeleton } from "@/components/page-skeleton"

async function EditCompanyContent({
  id,
}: {
  id: string
}) {
  const company = await getCompanyById(id)

  if (!company) {
    redirect("/dashboard/companies")
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Editar Empresa
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Actualiza la información de la empresa
        </p>
      </div>

      <CompanyEditClient company={company} />
    </div>
  )
}

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo super_admin puede acceder
  if (profile.role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditCompanyContent id={id} />
    </Suspense>
  )
}

