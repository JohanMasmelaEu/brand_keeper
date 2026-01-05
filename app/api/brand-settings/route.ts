import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createBrandSettingsSchema } from "@/lib/validations/schemas"
import type { CreateBrandSettingsFormData } from "@/lib/validations/schemas"
import {
  getAllBrandSettings,
  createBrandSettings,
} from "@/lib/supabase/brand"

/**
 * API Route para obtener todas las configuraciones de marca
 * GET /api/brand-settings
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

    // Obtener configuraciones según permisos
    const brandSettings = await getAllBrandSettings()

    return NextResponse.json(
      {
        success: true,
        data: brandSettings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo configuraciones de marca:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

/**
 * API Route para crear una nueva configuración de marca
 * POST /api/brand-settings
 */
export async function POST(request: NextRequest) {
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

    // Obtener y validar el cuerpo de la petición
    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = createBrandSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: CreateBrandSettingsFormData = validationResult.data

    // Crear la configuración de marca
    const brandSettings = await createBrandSettings({
      company_id: data.company_id,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color || null,
      font_family: data.font_family,
      logo_url: data.logo_url || null,
      is_global: data.is_global || false,
    })

    if (!brandSettings) {
      return NextResponse.json(
        {
          error: "Error al crear la configuración de marca",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Configuración de marca creada correctamente",
        data: brandSettings,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inesperado creando configuración de marca:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

