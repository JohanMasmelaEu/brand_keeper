import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateBrandSettingsSchema } from "@/lib/validations/schemas"
import type { UpdateBrandSettingsFormData } from "@/lib/validations/schemas"
import {
  getBrandSettingsById,
  updateBrandSettings,
  deleteBrandSettings,
} from "@/lib/supabase/brand"

/**
 * API Route para obtener una configuración de marca por ID
 * GET /api/brand-settings/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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
    const brandSettings = await getBrandSettingsById(id)

    if (!brandSettings) {
      return NextResponse.json(
        {
          error: "No se encontró la configuración de marca",
        },
        { status: 404 }
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

/**
 * API Route para actualizar una configuración de marca
 * PUT /api/brand-settings/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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
    const validationResult = updateBrandSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: UpdateBrandSettingsFormData = validationResult.data

    // Actualizar la configuración de marca
    const brandSettings = await updateBrandSettings(id, {
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      tertiary_color: data.tertiary_color,
      negative_color: data.negative_color,
      font_family: data.font_family,
      secondary_font: data.secondary_font,
      contrast_font: data.contrast_font,
      logo_url: data.logo_url,
      logo_variants: (body.logo_variants as Record<string, unknown>) || undefined,
    })

    if (!brandSettings) {
      return NextResponse.json(
        {
          error: "Error al actualizar la configuración de marca",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Configuración de marca actualizada correctamente",
        data: brandSettings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado actualizando configuración de marca:", error)
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
 * API Route para eliminar una configuración de marca
 * DELETE /api/brand-settings/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Eliminar la configuración de marca
    const success = await deleteBrandSettings(id)

    if (!success) {
      return NextResponse.json(
        {
          error: "Error al eliminar la configuración de marca",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Configuración de marca eliminada correctamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado eliminando configuración de marca:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

