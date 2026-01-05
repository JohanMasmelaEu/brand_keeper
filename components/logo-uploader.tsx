"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LogoUploaderProps {
  value?: string
  onChange: (url: string) => void
  companyId: string
  brandSettingsId?: string
  onUploadStart?: () => void
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
  disabled?: boolean
}

export function LogoUploader({
  value,
  onChange,
  companyId,
  brandSettingsId,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  disabled = false,
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(value || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("El archivo debe ser una imagen (PNG, JPG o SVG)")
      if (onUploadError) {
        onUploadError("Tipo de archivo no válido")
      }
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("La imagen no puede ser mayor a 5MB")
      if (onUploadError) {
        onUploadError("El archivo es demasiado grande")
      }
      return
    }

    // Crear preview local
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
    }
    reader.readAsDataURL(file)

    // Subir el archivo
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    if (!brandSettingsId) {
      toast.error("No se puede subir el logo sin una configuración de marca")
      return
    }

    setIsUploading(true)
    if (onUploadStart) {
      onUploadStart()
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/brand-settings/${brandSettingsId}/logo`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al subir el logo")
      }

      const data = await response.json()
      onChange(data.logo_url)
      setPreview(data.logo_url)

      if (onUploadComplete) {
        onUploadComplete(data.logo_url)
      }

      toast.success("Logo subido correctamente")
    } catch (error) {
      console.error("Error uploading logo:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast.error(errorMessage)
      if (onUploadError) {
        onUploadError(errorMessage)
      }
      // Restaurar preview anterior si hay error
      setPreview(value || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label>Logo de la marca</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Logo preview"
              className="h-20 w-20 object-contain border rounded-md"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="h-20 w-20 border rounded-md flex items-center justify-center bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileSelect}
            disabled={disabled || isUploading || !brandSettingsId}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG o SVG. Máximo 5MB
          </p>
        </div>
        {isUploading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  )
}

