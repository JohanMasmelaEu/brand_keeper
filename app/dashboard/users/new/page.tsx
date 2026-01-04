import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getAllCompanies } from "@/lib/supabase/company"
import { UserCreateClient } from "./user-create-client"
import { FormSkeleton } from "@/components/page-skeleton"

async function NewUserContent() {
  const companies = await getAllCompanies()

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Nuevo Usuario
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Crea un nuevo usuario en el sistema
        </p>
      </div>

      <UserCreateClient companies={companies} />
    </div>
  )
}

export default async function NewUserPage() {
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
      <NewUserContent />
    </Suspense>
  )
}

