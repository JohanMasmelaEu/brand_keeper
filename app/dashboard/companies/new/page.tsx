import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { CompanyForm } from "@/components/company-form"
import { FormSkeleton } from "@/components/page-skeleton"

async function NewCompanyContent() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Nueva Empresa
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Crea una nueva empresa hija
        </p>
      </div>

      <CompanyForm mode="create" />
    </div>
  )
}

export default async function NewCompanyPage() {
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
      <NewCompanyContent />
    </Suspense>
  )
}

