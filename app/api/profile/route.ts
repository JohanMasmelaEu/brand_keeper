import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateProfileSchema } from "@/lib/validations/schemas"
import type { UpdateProfileFormData } from "@/lib/validations/schemas"

/**
 * API Route para actualizar el perfil del usuario autenticado
 * PUT /api/profile
 */
export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: UpdateProfileFormData = validationResult.data

    // Verificar que el usuario existe y está activo
    const { data: existingProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (profileError || !existingProfile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado o inactivo" },
        { status: 404 }
      )
    }

    // Preparar los datos para actualizar (solo campos permitidos)
    const updateData: {
      full_name?: string | null
      avatar_url?: string | null
      updated_at?: string
    } = {
      updated_at: new Date().toISOString(),
    }

    // Solo actualizar full_name si se proporciona
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name || null
    }

    // Solo actualizar avatar_url si se proporciona
    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url || null
    }

    // Actualizar el perfil en la base de datos
    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error actualizando perfil:", updateError)
      return NextResponse.json(
        {
          error: "Error al actualizar el perfil",
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Retornar el perfil actualizado
    return NextResponse.json(
      {
        success: true,
        message: "Perfil actualizado correctamente",
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado en API de perfil:", error)
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
 * API Route para obtener el perfil del usuario autenticado
 * GET /api/profile
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

    // Obtener el perfil completo
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo perfil:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

