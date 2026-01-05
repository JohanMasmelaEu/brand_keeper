import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { BrandSettingsForm } from "@/components/brand-settings-form"
import { BrandSettingsFormActions } from "@/components/brand-settings-form-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSkeleton } from "@/components/page-skeleton"

async function NewBrandSettingsContent({
  searchParams,
}: {
  searchParams: Promise<{ company_id?: string }>
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo Super Admin y Admin pueden crear configuraciones
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    redirect("/dashboard")
  }

  const params = await searchParams
  // Para super_admin, permitir especificar company_id en query params
  // Para admin, siempre usar su propia empresa
  const companyId = 
    profile.role === "super_admin" && params?.company_id 
      ? params.company_id 
      : profile.company_id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Configuración de Marca</h1>
        <p className="text-muted-foreground mt-2">
          Crea una nueva configuración de marca para tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Marca</CardTitle>
          <CardDescription>
            Define los colores, tipografía y logo de tu marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandSettingsForm
            mode="create"
            companyId={companyId}
            userRole={profile.role}
            userCompanyId={profile.company_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function NewBrandSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ company_id?: string }>
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewBrandSettingsContent searchParams={searchParams} />
    </Suspense>
  )
}

