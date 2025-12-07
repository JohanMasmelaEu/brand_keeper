import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/user'

export default async function Home() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  // Redirigir al dashboard (el middleware también hace esto, pero por si acaso)
  redirect('/dashboard')
}

