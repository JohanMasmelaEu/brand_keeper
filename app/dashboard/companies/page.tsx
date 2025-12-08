import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { CompaniesView } from "@/components/companies-view"
import { TableSkeleton } from "@/components/page-skeleton"

async function CompaniesContent() {
  const companies = await getAllCompanies()

  return (
    <div className="w-full" suppressHydrationWarning>
      <CompaniesView companies={companies} />
    </div>
  )
}

export default async function CompaniesPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo super_admin puede acceder
  if (profile.role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<TableSkeleton />}>
        <CompaniesContent />
      </Suspense>
    </div>
  )
}

