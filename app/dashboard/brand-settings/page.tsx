import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getUserProfile } from "@/lib/supabase/user"
import { getBrandSettingsByCompanyId } from "@/lib/supabase/brand"
import { getAllCompanies } from "@/lib/supabase/company"
import { BrandSettingsView } from "@/components/brand-settings-view"
import { PageSkeleton } from "@/components/page-skeleton"

async function BrandSettingsContent({
  searchParams,
}: {
  searchParams: Promise<{ company_id?: string }>
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/login")
  }

  // Solo Super Admin y Admin pueden acceder
  if (profile.role !== "super_admin" && profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Obtener empresas (solo para super_admin, para otros roles será array vacío)
  const companies = profile.role === "super_admin" ? await getAllCompanies() : []
  
  // Debug: Verificar que las empresas se obtengan correctamente
  if (profile.role === "super_admin") {
    console.log('BrandSettingsPage - profile.role:', profile.role)
    console.log('BrandSettingsPage - companies:', companies)
    console.log('BrandSettingsPage - companies.length:', companies.length)
  }
  
  // Leer company_id de los searchParams si existe
  const params = await searchParams
  const queryCompanyId = params?.company_id

  // Determinar el companyId inicial
  // Para super_admin: usar company_id de query, o la primera empresa o la empresa matriz
  // Para admin: usar su propia empresa (no puede cambiar)
  let initialCompanyId = profile.company_id
  if (profile.role === "super_admin") {
    if (queryCompanyId && companies.some(c => c.id === queryCompanyId)) {
      // Si hay un company_id en la query y es válido, usarlo
      initialCompanyId = queryCompanyId
    } else if (companies.length > 0) {
      // Priorizar empresa matriz, si no existe, usar la primera
      const parentCompany = companies.find(c => c.is_parent)
      initialCompanyId = parentCompany?.id || companies[0].id
    }
  }

  const companyId = initialCompanyId
  const brandSettings = await getBrandSettingsByCompanyId(companyId, true)

  return (
    <BrandSettingsView
      brandSettings={brandSettings}
      companyId={companyId}
      userRole={profile.role}
      companies={companies}
      userCompanyId={profile.company_id}
    />
  )
}

export default async function BrandSettingsPage({
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
      <BrandSettingsContent searchParams={searchParams} />
    </Suspense>
  )
}

