import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getAllUsers } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { UsersView } from "@/components/users-view"
import { TableSkeleton } from "@/components/page-skeleton"

async function UsersContent() {
  const [users, companies] = await Promise.all([
    getAllUsers(),
    getAllCompanies(),
  ])

  return (
    <div className="w-full" suppressHydrationWarning>
      <UsersView users={users} companies={companies} />
    </div>
  )
}

export default async function UsersPage() {
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
        <UsersContent />
      </Suspense>
    </div>
  )
}

