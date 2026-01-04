import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUserProfile } from '@/lib/supabase/user'
import { getCompanyById } from '@/lib/supabase/company'
import { getAvailableTemplatesForUser } from '@/lib/supabase/email-signature'
import { EmailSignatureGenerator } from '@/components/email-signature-generator'
import { PageSkeleton } from '@/components/page-skeleton'
import type { CompanyBrandData } from '@/lib/types/email-signature'

async function EmailSignatureGeneratorContent() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Obtener plantillas disponibles para el usuario
  const templates = await getAvailableTemplatesForUser()

  if (templates.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
            Generador de Firma
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            Genera tu firma de correo personalizada
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay plantillas disponibles para generar firmas</p>
        </div>
      </div>
    )
  }

  // Obtener datos de la empresa para la marca
  const company = await getCompanyById(profile.company_id)
  
  const companyBrand: CompanyBrandData = {
    name: company?.name || '',
    logo_url: company?.logo_url || null,
    website: company?.website || null,
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
          Generador de Firma
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">
          Genera tu firma de correo personalizada
        </p>
      </div>

      <EmailSignatureGenerator
        templates={templates}
        companyBrand={companyBrand}
        userEmail={profile.email}
        userFullName={profile.full_name}
      />
    </div>
  )
}

export default async function EmailSignatureGeneratorPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <EmailSignatureGeneratorContent />
    </Suspense>
  )
}

