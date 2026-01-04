import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { 
  createEmailSignatureTemplateSchema,
  updateEmailSignatureTemplateSchema 
} from "@/lib/validations/schemas"
import type { 
  CreateEmailSignatureTemplateFormData,
  UpdateEmailSignatureTemplateFormData 
} from "@/lib/validations/schemas"
import {
  getEmailSignatureTemplates,
  createEmailSignatureTemplate,
} from "@/lib/supabase/email-signature"

/**
 * API Route para obtener todas las plantillas de firma
 * GET /api/email-signatures
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

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado." },
        { status: 404 }
      )
    }

    // Obtener parámetro includeInactive de query
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    // Solo Super Admin y Admin pueden ver inactivas
    const templates = await getEmailSignatureTemplates(
      includeInactive && (profile.role === "super_admin" || profile.role === "admin")
    )

    return NextResponse.json(
      {
        success: true,
        templates,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo plantillas:", error)
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
 * API Route para crear una nueva plantilla de firma
 * POST /api/email-signatures
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

    // Verificar que sea super_admin o admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || (profile.role !== "super_admin" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "No tienes permisos para crear plantillas." },
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
    const validationResult = createEmailSignatureTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: CreateEmailSignatureTemplateFormData = validationResult.data

    // Crear la plantilla
    const template = await createEmailSignatureTemplate(data)

    if (!template) {
      return NextResponse.json(
        {
          error: "Error al crear la plantilla",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Plantilla creada correctamente",
        template,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inesperado creando plantilla:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

