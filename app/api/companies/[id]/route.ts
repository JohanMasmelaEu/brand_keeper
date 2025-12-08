import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateCompanySchema } from "@/lib/validations/schemas"
import type { UpdateCompanyFormData } from "@/lib/validations/schemas"
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
  isSlugAvailable,
} from "@/lib/supabase/company"

/**
 * API Route para obtener una empresa por ID
 * GET /api/companies/[id]
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
        { error: "No tienes permisos para ver empresas." },
        { status: 403 }
      )
    }

    const company = await getCompanyById(id)

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        company,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo empresa:", error)
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
 * API Route para actualizar una empresa
 * PUT /api/companies/[id]
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
        { error: "No tienes permisos para actualizar empresas." },
        { status: 403 }
      )
    }

    // Verificar que la empresa existe
    const existingCompany = await getCompanyById(id)
    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    // No permitir editar la empresa matriz
    if (existingCompany.is_parent) {
      return NextResponse.json(
        { error: "No se puede editar la empresa matriz" },
        { status: 400 }
      )
    }

    // Obtener y validar el cuerpo de la petición
    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = updateCompanySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: UpdateCompanyFormData = validationResult.data

    // Si se actualiza el nombre, generar nuevo slug automáticamente
    let slugToUse = existingCompany.slug
    if (data.name && data.name !== existingCompany.name) {
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
          .replace(/^-+|-+$/g, "") // Eliminar guiones al inicio y final
      }
      
      slugToUse = generateSlug(data.name)
      
      // Verificar que el nuevo slug esté disponible
      if (slugToUse !== existingCompany.slug) {
        const slugAvailable = await isSlugAvailable(slugToUse, id)
        if (!slugAvailable) {
          return NextResponse.json(
            {
              error: "El slug generado ya está en uso. Por favor, modifica el nombre de la empresa.",
            },
            { status: 400 }
          )
        }
      }
    }

    // Actualizar la empresa
    const company = await updateCompany(id, {
      name: data.name,
      slug: slugToUse !== existingCompany.slug ? slugToUse : undefined,
      website: data.website || undefined,
      logoUrl: data.logo_url || undefined,
      legalName: data.legal_name || undefined,
      address: data.address || undefined,
      country: data.country || undefined,
    })

    if (!company) {
      return NextResponse.json(
        {
          error: "Error al actualizar la empresa",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa actualizada correctamente",
        company,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado actualizando empresa:", error)
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
 * API Route para eliminar una empresa
 * DELETE /api/companies/[id]
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
      .select("role")
      .eq("id", user.id)
      .eq("is_active", true)
      .single()

    if (!profile || profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar empresas." },
        { status: 403 }
      )
    }

    // Verificar que la empresa existe
    const existingCompany = await getCompanyById(id)
    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      )
    }

    // Intentar eliminar la empresa
    const deleted = await deleteCompany(id)

    if (!deleted) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la empresa. Verifica que no sea la empresa matriz y que no tenga usuarios asociados.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa eliminada correctamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado eliminando empresa:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

