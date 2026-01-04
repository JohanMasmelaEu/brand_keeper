import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateEmailSignatureTemplateSchema } from "@/lib/validations/schemas"
import type { UpdateEmailSignatureTemplateFormData } from "@/lib/validations/schemas"
import {
  getEmailSignatureTemplateById,
  updateEmailSignatureTemplate,
  deleteEmailSignatureTemplate,
} from "@/lib/supabase/email-signature"

/**
 * API Route para obtener una plantilla de firma por ID
 * GET /api/email-signatures/[id]
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

    // Obtener la plantilla
    const template = await getEmailSignatureTemplateById(id)

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada o no tienes permisos para verla." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        template,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo plantilla:", error)
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
 * API Route para actualizar una plantilla de firma
 * PUT /api/email-signatures/[id]
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

    // Verificar que sea super_admin o admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar plantillas." },
        { status: 403 }
      )
    }

    // Obtener y validar el cuerpo de la petición
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type debe ser application/json" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = updateEmailSignatureTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: UpdateEmailSignatureTemplateFormData = validationResult.data

    // Actualizar la plantilla
    const template = await updateEmailSignatureTemplate(id, data)

    if (!template) {
      return NextResponse.json(
        {
          error: "Error al actualizar la plantilla",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Plantilla actualizada correctamente",
        template,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado actualizando plantilla:", error)
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
 * API Route para eliminar una plantilla de firma
 * DELETE /api/email-signatures/[id]
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

    // Verificar que sea super_admin o admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar plantillas." },
        { status: 403 }
      )
    }

    // Eliminar la plantilla
    await deleteEmailSignatureTemplate(id)

    return NextResponse.json(
      {
        success: true,
        message: "Plantilla eliminada correctamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado eliminando plantilla:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

