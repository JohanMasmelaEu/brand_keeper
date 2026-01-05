import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getBrandSettingsById } from "@/lib/supabase/brand"
import { BrandSettingsForm } from "@/components/brand-settings-form"
import { BrandSettingsFormActions } from "@/components/brand-settings-form-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageSkeleton } from "@/components/page-skeleton"

async function EditBrandSettingsContent({ id }: { id: string }) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo Super Admin y Admin pueden editar configuraciones
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Obtener la configuración de marca
  const brandSettings = await getBrandSettingsById(id)

  if (!brandSettings) {
    redirect("/dashboard/brand-settings")
  }

  // Validar permisos: Admin solo puede editar configuraciones de su empresa (no globales)
  if (
    profile.role === "admin" &&
    (brandSettings.company_id !== profile.company_id || brandSettings.is_global)
  ) {
    redirect("/dashboard/brand-settings")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Configuración de Marca</h1>
        <p className="text-muted-foreground mt-2">
          Actualiza la configuración de marca de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Marca</CardTitle>
          <CardDescription>
            Actualiza los colores, tipografía y logo de tu marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandSettingsForm
            brandSettings={brandSettings}
            mode="edit"
            companyId={brandSettings.company_id}
            userRole={profile.role}
            userCompanyId={profile.company_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function EditBrandSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await getUserProfile()
  const { id } = await params

  if (!profile) {
    redirect("/login")
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditBrandSettingsContent id={id} />
    </Suspense>
  )
}

