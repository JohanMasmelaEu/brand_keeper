import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getBrandSettingsByCompanyId } from "@/lib/supabase/brand"

/**
 * API Route para obtener configuración de marca de una empresa específica
 * GET /api/brand-settings/company/[company_id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const supabase = await createClient()
    const { company_id } = await params

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

    // Obtener configuración de marca
    const brandSettings = await getBrandSettingsByCompanyId(company_id, true)

    if (!brandSettings) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: "No se encontró configuración de marca para esta empresa",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: brandSettings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo configuración de marca:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

