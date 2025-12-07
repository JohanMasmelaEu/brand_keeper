import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Auth callback: ${error.message}`)
      }
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }
  }

  // Redirigir al dashboard (el middleware se encargará de redirigir según el rol)
  const redirectPath = next !== '/' ? next : '/dashboard'
  return NextResponse.redirect(`${origin}${redirectPath}`)
}

