import { NextRequest, NextResponse } from "next/server"
import {
  getCompanySocialMedia,
  updateCompanySocialMedia,
} from "@/lib/supabase/social-media"
import type { SocialMediaType } from "@/lib/types/social-media"

/**
 * GET /api/companies/[id]/social-media
 * Obtiene todas las redes sociales de una empresa
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 }
      )
    }

    const socialMedia = await getCompanySocialMedia(id)

    return NextResponse.json({ socialMedia })
  } catch (error) {
    console.error("Error obteniendo redes sociales:", error)
    return NextResponse.json(
      { error: "Error inesperado obteniendo redes sociales" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/companies/[id]/social-media
 * Actualiza las redes sociales de una empresa
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { socialMedia } = body

    if (!Array.isArray(socialMedia)) {
      return NextResponse.json(
        { error: "socialMedia debe ser un array" },
        { status: 400 }
      )
    }

    // Validar estructura de cada red social
    for (const sm of socialMedia) {
      if (!sm.type || !sm.hasOwnProperty('url')) {
        return NextResponse.json(
          { error: "Cada red social debe tener 'type' y 'url'" },
          { status: 400 }
        )
      }
    }

    const updated = await updateCompanySocialMedia(
      id,
      socialMedia as Array<{ type: SocialMediaType; url: string }>
    )

    return NextResponse.json({ socialMedia: updated })
  } catch (error) {
    console.error("Error actualizando redes sociales:", {
      error,
      message: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: "Error inesperado actualizando redes sociales",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}

