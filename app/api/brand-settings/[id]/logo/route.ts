import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getBrandSettingsById, updateBrandSettings } from "@/lib/supabase/brand"

/**
 * API Route para subir logo de una configuración de marca
 * POST /api/brand-settings/[id]/logo
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

    // Verificar que la configuración existe y el usuario tiene permisos
    const brandSettings = await getBrandSettingsById(id)
    if (!brandSettings) {
      return NextResponse.json(
        { error: "No se encontró la configuración de marca" },
        { status: 404 }
      )
    }

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen (PNG, JPG o SVG)" },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen no puede ser mayor a 5MB" },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop()
    const fileName = `logo-${Date.now()}.${fileExt}`
    const filePath = `${brandSettings.company_id}/${fileName}`

    // Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir el archivo a Supabase Storage
    // Intentar con diferentes nombres de bucket (case-insensitive)
    const bucketNames = ["brand-logos", "BRAND-LOGOS", "Brand-Logos"]
    let uploadData = null
    let uploadError = null
    let usedBucket = ""

    for (const bucketName of bucketNames) {
      const result = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true, // Reemplazar si ya existe
        })

      if (!result.error) {
        uploadData = result.data
        usedBucket = bucketName
        break
      } else {
        uploadError = result.error
        // Si es error de bucket no encontrado, intentar el siguiente
        if (result.error.message?.includes("Bucket") || result.error.message?.includes("not found")) {
          continue
        }
        // Si es otro error (permisos, etc.), detener
        break
      }
    }

    if (uploadError || !uploadData) {
      console.error("Error subiendo logo:", {
        error: uploadError,
        bucket: usedBucket || "ninguno funcionó",
        filePath,
        fileSize: file.size,
        fileType: file.type,
        brandSettingsId: id,
      })
      return NextResponse.json(
        {
          error: "Error al subir la imagen",
          details: uploadError?.message || "No se pudo subir la imagen a ningún bucket",
          bucket: usedBucket || "no encontrado",
        },
        { status: 500 }
      )
    }

    // Obtener la URL pública de la imagen
    const {
      data: { publicUrl },
    } = supabase.storage.from(usedBucket || "brand-logos").getPublicUrl(filePath)

    // Función helper para extraer el path del archivo de la URL de Supabase Storage
    const extractFilePathFromUrl = (url: string | null): string | null => {
      if (!url) return null
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split("/").filter(Boolean)
        const publicIndex = pathParts.indexOf("public")
        if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
          const filePath = pathParts.slice(publicIndex + 2).join("/")
          return filePath
        }
        return null
      } catch (error) {
        console.error("Error extrayendo path de URL:", error)
        return null
      }
    }

    // Eliminar el logo anterior si existe (solo si es diferente al nuevo)
    if (brandSettings.logo_url && brandSettings.logo_url !== publicUrl) {
      const oldFilePath = extractFilePathFromUrl(brandSettings.logo_url)
      if (oldFilePath && oldFilePath !== filePath) {
        // Intentar eliminar de todos los buckets posibles
        for (const bucketName of bucketNames) {
          const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([oldFilePath])

          // Si se eliminó exitosamente o el archivo no existe, continuar
          if (!deleteError || deleteError.message?.includes("not found")) {
            break
          }
        }
      }
    }

    // Actualizar la configuración de marca con la nueva URL del logo
    const updatedSettings = await updateBrandSettings(id, {
      logo_url: publicUrl,
    })

    if (!updatedSettings) {
      return NextResponse.json(
        {
          error: "Error al actualizar la configuración de marca con el nuevo logo",
        },
        { status: 500 }
      )
    }

    // Retornar la URL de la imagen
    return NextResponse.json(
      {
        success: true,
        logo_url: publicUrl,
        path: filePath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado subiendo logo:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

