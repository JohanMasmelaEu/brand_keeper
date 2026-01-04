import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getUserProfile } from '@/lib/supabase/user'
import { getEmailSignatureTemplates } from '@/lib/supabase/email-signature'
import { EmailSignaturesView } from '@/components/email-signatures-view'
import { PageSkeleton } from '@/components/page-skeleton'

async function EmailSignaturesContent() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Solo Super Admin y Admin pueden acceder
  if (profile.role !== 'super_admin' && profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // Obtener plantillas (incluyendo inactivas para admins)
  const templates = await getEmailSignatureTemplates(true)

  return <EmailSignaturesView templates={templates} />
}

export default async function EmailSignaturesPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <EmailSignaturesContent />
    </Suspense>
  )
}

