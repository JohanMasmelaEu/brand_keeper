"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { updateProfileSchema } from "@/lib/validations/schemas"
import type { UserRole } from "@/lib/types/user"
import { Loader2, Camera } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string | null
  userEmail?: string | null
  userRole?: UserRole
  companyName?: string | null
  avatarUrl?: string | null
}

export function UserProfileModal({
  open,
  onOpenChange,
  userName,
  userEmail,
  userRole,
  companyName,
  avatarUrl,
}: UserProfileModalProps) {
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [updateSuccess, setUpdateSuccess] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Hook personalizado para manejo de formularios con validación
  const { form, onSubmit, isSubmitting, error, setError } = useFormValidation({
    schema: updateProfileSchema,
    defaultValues: {
      full_name: userName || "",
    },
    onSubmit: async (data) => {
      setIsUpdating(true)
      setError(null)
      setUpdateSuccess(false)

      try {
        let avatarUrlToUpdate: string | null = null

        // Si hay una imagen seleccionada, subirla primero
        if (selectedFile) {
          const formData = new FormData()
          formData.append("file", selectedFile)

          const uploadResponse = await fetch("/api/profile/avatar", {
            method: "POST",
            body: formData,
          })

          const uploadResult = await uploadResponse.json()

          if (!uploadResponse.ok) {
            console.error("Error en upload:", uploadResult)
            throw new Error(
              uploadResult.error || uploadResult.details || "Error al subir la imagen"
            )
          }

          avatarUrlToUpdate = uploadResult.url
        }

        // Llamar a la API route para actualizar el perfil
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: data.full_name || null,
            avatar_url: avatarUrlToUpdate !== null ? avatarUrlToUpdate : undefined,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Error al actualizar el perfil")
        }

        setUpdateSuccess(true)

        // Cerrar el modal después de un breve delay para mostrar el mensaje de éxito
        setTimeout(() => {
          onOpenChange(false)
          // Recargar la página para reflejar los cambios
          window.location.reload()
        }, 1000)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error inesperado al actualizar el perfil"
        setError(errorMessage)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
  })

  // Obtener iniciales del usuario para el avatar
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name[0]?.toUpperCase() || "U"
    }
    if (email) {
      return email[0]?.toUpperCase() || "U"
    }
    return "U"
  }

  // Función para obtener el nombre del rol en español
  const getRoleName = (role?: UserRole) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador"
      case "admin":
        return "Administrador"
      case "collaborator":
        return "Colaborador"
      default:
        return "N/A"
    }
  }

  // Resetear el formulario cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      form.reset({
        full_name: userName || "",
      })
      setError(null)
      setUpdateSuccess(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setCropImageSrc(null)
      setIsCropDialogOpen(false)
    }
  }, [open, userName, form, setError])

  // Manejar cuando se completa el recorte
  const handleCropComplete = (croppedBlob: Blob) => {
    // Convertir Blob a File
    const file = new File([croppedBlob], "avatar.jpg", {
      type: "image/jpeg",
    })
    setSelectedFile(file)
    // Crear preview de la imagen recortada
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(croppedBlob)
    setIsCropDialogOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal. Los cambios se reflejarán en toda la aplicación.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={previewUrl || avatarUrl || undefined}
                alt={userName || "Usuario"}
              />
              <AvatarFallback className="text-4xl">
                {getInitials(userName, userEmail)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || isUpdating}
              title="Cambiar foto de perfil"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  setError("La imagen no puede ser mayor a 5MB")
                  return
                }
                // Validar tipo
                if (!file.type.startsWith("image/")) {
                  setError("Solo se permiten archivos de imagen")
                  return
                }
                // Crear preview y abrir el cropper
                const reader = new FileReader()
                reader.onloadend = () => {
                  setCropImageSrc(reader.result as string)
                  setIsCropDialogOpen(true)
                }
                reader.readAsDataURL(file)
                setError(null)
              }
            }}
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {selectedFile.name}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa tu nombre completo"
                      disabled={isSubmitting || isUpdating}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input
                value={userEmail || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El correo electrónico no se puede modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Input
                value={getRoleName(userRole)}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El rol no se puede modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input
                value={companyName || "N/A"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                La empresa no se puede modificar
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {updateSuccess && (
              <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                Perfil actualizado correctamente
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isUpdating}
                className="flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUpdating}
                className="flex-1 sm:flex-initial"
              >
                {(isSubmitting || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting || isUpdating ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Dialog de recorte de imagen */}
      {cropImageSrc && (
        <ImageCropper
          open={isCropDialogOpen}
          onOpenChange={setIsCropDialogOpen}
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </Dialog>
  )
}

