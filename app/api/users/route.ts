import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createUserSchema } from "@/lib/validations/schemas"
import type { CreateUserFormData } from "@/lib/validations/schemas"
import { getAllUsers, createUser } from "@/lib/supabase/user"
import { generateRandomPassword } from "@/lib/utils/password"
import { sendWelcomeEmail } from "@/lib/utils/email"

/**
 * API Route para obtener todos los usuarios
 * GET /api/users
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

    const users = await getAllUsers()

    return NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo usuarios:", error)
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
 * API Route para crear un nuevo usuario
 * POST /api/users
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

    // Verificar que sea super_admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "No tienes permisos para crear usuarios." },
        { status: 403 }
      )
    }

    // Obtener y validar el cuerpo de la petición
    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = createUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: CreateUserFormData = validationResult.data

    // Generar contraseña aleatoria
    const password = generateRandomPassword(12)

    // Crear el usuario
    const result = await createUser(
      data.email,
      password,
      data.role,
      data.company_id,
      data.full_name || undefined,
      (body as any).avatar_url
    )

    if (result.error || !result.user) {
      return NextResponse.json(
        {
          error: result.error || "Error al crear el usuario. Verifica que el email no esté en uso y que la empresa sea válida.",
        },
        { status: 400 }
      )
    }

    const newUser = result.user

    // Enviar correo de bienvenida con la contraseña
    let emailSent = false
    let emailError: string | null = null
    
    try {
      await sendWelcomeEmail(
        data.email,
        password,
        data.full_name || undefined
      )
      emailSent = true
    } catch (error) {
      // Log del error pero no fallar la creación del usuario
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error enviando correo de bienvenida:", error)
      emailError = errorMessage
      // El usuario ya fue creado, así que continuamos
    }

    // Construir mensaje según si el correo se envió o no
    let message = "Usuario creado correctamente."
    if (emailSent) {
      message += " Se ha enviado un correo con las credenciales de acceso."
    } else {
      message += ` ⚠️ No se pudo enviar el correo: ${emailError || "Error desconocido"}. La contraseña es: ${password}`
    }

    return NextResponse.json(
      {
        success: true,
        message,
        user: newUser,
        emailSent,
        ...(emailError && { emailError }),
        ...(!emailSent && { password }), // Incluir contraseña si no se envió el correo
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inesperado creando usuario:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

