import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateUserSchema, changeUserPasswordSchema } from "@/lib/validations/schemas"
import type { UpdateUserFormData, ChangeUserPasswordFormData } from "@/lib/validations/schemas"
import {
  getUserProfileById,
  updateUser,
  deleteUser,
  reactivateUser,
} from "@/lib/supabase/user"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * API Route para obtener un usuario por ID
 * GET /api/users/[id]
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

    // Verificar que sea super_admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "No tienes permisos para ver usuarios." },
        { status: 403 }
      )
    }

    const userProfile = await getUserProfileById(id)

    if (!userProfile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: userProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo usuario:", error)
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
 * API Route para actualizar un usuario
 * PUT /api/users/[id]
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

    // Verificar que sea super_admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar usuarios." },
        { status: 403 }
      )
    }

    // Verificar que el usuario existe
    const existingUser = await getUserProfileById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Obtener y validar el cuerpo de la petición
    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = updateUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: UpdateUserFormData = validationResult.data

    // Actualizar el usuario
    const updatedUser = await updateUser(id, {
      email: data.email,
      fullName: data.full_name || undefined,
      role: data.role,
      companyId: data.company_id,
      isActive: data.is_active,
      avatarUrl: (body as any).avatar_url,
    })

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: "Error al actualizar el usuario",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario actualizado correctamente",
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado actualizando usuario:", error)
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
 * API Route para eliminar (desactivar) un usuario
 * DELETE /api/users/[id]
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

    // Verificar que sea super_admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, id")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios." },
        { status: 403 }
      )
    }

    // No permitir desactivar a sí mismo
    if (profile.id === id) {
      return NextResponse.json(
        { error: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const existingUser = await getUserProfileById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Desactivar el usuario
    const deleted = await deleteUser(id)

    if (!deleted) {
      return NextResponse.json(
        {
          error: "Error al desactivar el usuario",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario desactivado correctamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado eliminando usuario:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

