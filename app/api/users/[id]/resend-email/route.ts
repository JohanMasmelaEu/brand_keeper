import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getUserProfileById } from "@/lib/supabase/user"
import { generateRandomPassword } from "@/lib/utils/password"
import { sendWelcomeEmail } from "@/lib/utils/email"

/**
 * API Route TEMPORAL para reenviar correo de bienvenida a un usuario
 * POST /api/users/[id]/resend-email
 * TODO: Eliminar esta ruta después de las pruebas
 */
export async function POST(
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
        { error: "No tienes permisos para reenviar correos." },
        { status: 403 }
      )
    }

    // Obtener el usuario
    const userProfile = await getUserProfileById(id)

    if (!userProfile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Generar nueva contraseña temporal
    const newPassword = generateRandomPassword(12)

    // Actualizar la contraseña del usuario en Supabase Auth usando admin client
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      id,
      {
        password: newPassword,
      }
    )

    if (updateError) {
      console.error("Error actualizando contraseña:", updateError)
      return NextResponse.json(
        {
          error: "Error al actualizar la contraseña del usuario",
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Enviar correo de bienvenida con la nueva contraseña
    let emailSent = false
    let emailError: string | null = null

    try {
      await sendWelcomeEmail(
        userProfile.email,
        newPassword,
        userProfile.full_name || undefined
      )
      emailSent = true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error enviando correo de bienvenida:", error)
      emailError = errorMessage
    }

    // Construir mensaje según si el correo se envió o no
    let message = "Correo de bienvenida reenviado correctamente."
    if (!emailSent) {
      message += ` ⚠️ No se pudo enviar el correo: ${emailError || "Error desconocido"}. La nueva contraseña es: ${newPassword}`
    }

    return NextResponse.json(
      {
        success: true,
        message,
        emailSent,
        ...(emailError && { emailError }),
        ...(!emailSent && { password: newPassword }), // Incluir contraseña si no se envió el correo
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado reenviando correo:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

