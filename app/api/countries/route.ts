import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCountries } from "@/lib/supabase/country"

/**
 * API Route para obtener todos los países
 * GET /api/countries
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      )
    }

    const countries = await getCountries()

    return NextResponse.json(
      {
        success: true,
        countries,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo países:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

