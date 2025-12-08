import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCompanySchema, updateCompanySchema } from "@/lib/validations/schemas"
import type { CreateCompanyFormData, UpdateCompanyFormData } from "@/lib/validations/schemas"
import {
  getAllCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  isSlugAvailable,
} from "@/lib/supabase/company"

/**
 * API Route para obtener todas las empresas
 * GET /api/companies
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
        { error: "No tienes permisos para ver empresas." },
        { status: 403 }
      )
    }

    const companies = await getAllCompanies()

    return NextResponse.json(
      {
        success: true,
        companies,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado obteniendo empresas:", error)
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
 * API Route para crear una nueva empresa
 * POST /api/companies
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
        { error: "No tienes permisos para crear empresas." },
        { status: 403 }
      )
    }

    // Obtener y validar el cuerpo de la petición
    const body = await request.json()

    // Validar los datos con Zod
    const validationResult = createCompanySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data: CreateCompanyFormData = validationResult.data

    // Generar slug automáticamente desde el nombre
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
        .replace(/^-+|-+$/g, "") // Eliminar guiones al inicio y final
    }

    const slug = generateSlug(data.name)

    // Verificar que el slug esté disponible
    const slugAvailable = await isSlugAvailable(slug)
    if (!slugAvailable) {
      return NextResponse.json(
        {
          error: "El slug generado ya está en uso. Por favor, modifica el nombre de la empresa.",
        },
        { status: 400 }
      )
    }

    // Crear la empresa
    const company = await createCompany(
      data.name,
      slug,
      data.website || undefined,
      data.logo_url || undefined,
      data.legal_name || undefined,
      data.address || undefined,
      data.country || undefined
    )

    if (!company) {
      return NextResponse.json(
        {
          error: "Error al crear la empresa",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Empresa creada correctamente",
        company,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inesperado creando empresa:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

