import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API Route para subir la imagen de avatar del usuario
 * POST /api/profile/avatar
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
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
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
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir el archivo a Supabase Storage
    // Intentar con diferentes nombres de bucket (case-insensitive)
    const bucketNames = ["user-avatars", "USER-AVATARS", "User-Avatars"]
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
      console.error("Error subiendo avatar:", {
        error: uploadError,
        bucket: usedBucket || "ninguno funcionó",
        filePath,
        fileSize: file.size,
        fileType: file.type,
        userId: user.id,
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
    } = supabase.storage.from(usedBucket || "user-avatars").getPublicUrl(filePath)

    // Obtener el avatar anterior del usuario para eliminarlo después
    const { data: currentProfile } = await supabase
      .from("user_profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()

    // Función helper para extraer el path del archivo de la URL de Supabase Storage
    const extractFilePathFromUrl = (url: string | null): string | null => {
      if (!url) return null
      try {
        // La URL de Supabase Storage tiene el formato:
        // https://[project-id].supabase.co/storage/v1/object/public/[bucket-name]/[path]
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split("/").filter(Boolean) // Filtrar strings vacíos
        
        // Buscar el índice de "public"
        const publicIndex = pathParts.indexOf("public")
        if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
          // Obtener todo después de "public/[bucket-name]/"
          // pathParts[publicIndex + 1] = bucket-name
          // pathParts[publicIndex + 2...] = file path
          const filePath = pathParts.slice(publicIndex + 2).join("/")
          return filePath
        }
        return null
      } catch (error) {
        console.error("Error extrayendo path de URL:", error)
        return null
      }
    }

    // Eliminar la imagen anterior si existe (solo si es diferente a la nueva)
    if (currentProfile?.avatar_url && currentProfile.avatar_url !== publicUrl) {
      const oldFilePath = extractFilePathFromUrl(currentProfile.avatar_url)
      if (oldFilePath && oldFilePath !== filePath) {
        // Intentar eliminar de todos los buckets posibles
        const bucketNames = ["user-avatars", "USER-AVATARS", "User-Avatars"]
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

    // Retornar la URL de la imagen
    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        path: filePath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error inesperado subiendo avatar:", error)
    return NextResponse.json(
      {
        error: "Error inesperado al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

