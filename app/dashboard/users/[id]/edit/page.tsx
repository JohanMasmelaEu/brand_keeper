import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile, getUserProfileById } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { UserEditClient } from "./user-edit-client"
import { FormSkeleton } from "@/components/page-skeleton"

async function EditUserContent({
  id,
}: {
  id: string
}) {
  const [user, companies] = await Promise.all([
    getUserProfileById(id),
    getAllCompanies(),
  ])

  if (!user) {
    redirect("/dashboard/users")
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Editar Usuario
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Actualiza la información del usuario
        </p>
      </div>

      <UserEditClient user={user} companies={companies} />
    </div>
  )
}

export default async function EditUserPage({
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
      <EditUserContent id={id} />
    </Suspense>
  )
}

