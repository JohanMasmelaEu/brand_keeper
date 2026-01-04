"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageCropper } from "@/components/image-cropper"
import { createUserSchema, updateUserSchema } from "@/lib/validations/schemas"
import type { CreateUserFormData, UpdateUserFormData } from "@/lib/validations/schemas"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/types/user"
import type { Company } from "@/lib/types/user"
import { toast } from "sonner"

interface UserFormProps {
  user?: UserProfile
  companies: Company[]
  mode: "create" | "edit"
  onFormReady?: (form: ReturnType<typeof useForm<CreateUserFormData | UpdateUserFormData>>, isSubmitting: boolean, onSubmit: (data: any) => Promise<void>) => void
  onFormChange?: (values: Partial<CreateUserFormData | UpdateUserFormData>) => void
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  collaborator: "Colaborador",
}

export function UserForm({ user, companies, mode, onFormReady, onFormChange }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(user?.avatar_url || null)
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const schema = mode === "create" ? createUserSchema : updateUserSchema
  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: user
      ? {
          email: user.email,
          full_name: user.full_name || "",
          role: user.role,
          company_id: user.company_id || "",
          is_active: user.is_active,
        }
      : {
          email: "",
          full_name: "",
          role: "collaborator" as const,
          company_id: "",
        },
  })

  // Asegurar que el rol siempre tenga un valor válido en modo creación
  React.useEffect(() => {
    if (mode === "create") {
      const currentRole = form.getValues("role")
      if (!currentRole || !["super_admin", "admin", "collaborator"].includes(currentRole)) {
        form.setValue("role", "collaborator", { shouldValidate: true })
      }
    }
  }, [mode, form])

  // Observar cambios en el formulario para actualizar el documento en tiempo real
  // Deshabilitar temporalmente durante el montaje para evitar bucles infinitos
  const previousValuesRef = React.useRef<string>("")
  const onFormChangeRef = React.useRef(onFormChange)
  const isMountedRef = React.useRef(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Actualizar la ref cuando cambia onFormChange
  React.useEffect(() => {
    onFormChangeRef.current = onFormChange
  }, [onFormChange])
  
  // Marcar como montado después de un delay significativo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      isMountedRef.current = true
    }, 1000)
    return () => clearTimeout(timer)
  }, [])
  
  // Usar refs para form y mode para evitar dependencias problemáticas
  const formRef = React.useRef(form)
  const modeRef = React.useRef(mode)
  
  React.useEffect(() => {
    formRef.current = form
    modeRef.current = mode
  }, [form, mode])
  
  // Usar un enfoque más simple: solo actualizar cuando el usuario interactúa
  // No usar form.watch() para evitar re-renders constantes
  const handleFormValueChange = React.useCallback(() => {
    if (!isMountedRef.current || !onFormChangeRef.current) return
    
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Usar getValues directamente del form ref
    const formValues = formRef.current.getValues()
    const currentValues: any = {
      email: formValues.email,
      full_name: formValues.full_name,
      role: formValues.role,
      company_id: formValues.company_id,
      avatar_url: previewUrl || undefined,
    }
    
    // Solo incluir is_active si estamos en modo edición
    if (modeRef.current === "edit") {
      const editValues = formValues as UpdateUserFormData
      if (editValues.is_active !== undefined) {
        currentValues.is_active = editValues.is_active
      }
    }
    
    // Serializar valores para comparación
    const currentValuesStr = JSON.stringify(currentValues)
    
    // Solo actualizar si los valores realmente cambiaron
    if (currentValuesStr !== previousValuesRef.current) {
      previousValuesRef.current = currentValuesStr
      // Usar debounce para evitar actualizaciones muy frecuentes
      timeoutRef.current = setTimeout(() => {
        if (onFormChangeRef.current) {
          onFormChangeRef.current(currentValues)
        }
      }, 300)
    }
  }, [])

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
      // Actualizar el documento con la nueva imagen
      if (onFormChangeRef.current) {
        const formValues = formRef.current.getValues()
        onFormChangeRef.current({
          ...formValues,
          avatar_url: reader.result as string,
        } as any)
      }
    }
    reader.readAsDataURL(croppedBlob)
    setIsCropDialogOpen(false)
  }

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen")
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("La imagen no puede ser mayor a 5MB")
      return
    }

    // Crear preview y abrir el cropper
    const reader = new FileReader()
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string)
      setIsCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true)

    try {
      let avatarUrl: string | null = null

      // Si hay una imagen seleccionada, subirla primero
      if (selectedFile) {
        try {
          const formData = new FormData()
          formData.append("file", selectedFile)

          const uploadResponse = await fetch("/api/profile/avatar", {
            method: "POST",
            body: formData,
          })

          const contentType = uploadResponse.headers.get("content-type")
          let uploadResult

          if (contentType && contentType.includes("application/json")) {
            uploadResult = await uploadResponse.json()
          } else {
            const text = await uploadResponse.text()
            console.error("Respuesta no JSON del servidor (upload):", text)
            throw new Error("Error al subir la imagen: respuesta inválida del servidor")
          }

          if (!uploadResponse.ok) {
            throw new Error(
              uploadResult.error || uploadResult.details || "Error al subir la imagen"
            )
          }

          avatarUrl = uploadResult.url
        } catch (uploadError) {
          console.error("Error subiendo imagen:", uploadError)
          toast.error(
            uploadError instanceof Error
              ? uploadError.message
              : "Error al subir la imagen del usuario"
          )
          setIsSubmitting(false)
          return
        }
      }

      // Preparar datos para enviar
      const userData: any = {
        ...data,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      }

      const url = mode === "create" ? "/api/users" : `/api/users/${user?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || `Error al ${mode === "create" ? "crear" : "actualizar"} el usuario`)
        setIsSubmitting(false)
        return
      }

      toast.success(`Usuario ${mode === "create" ? "creado" : "actualizado"} correctamente`)

      // Si es modo edición, esperar 2 segundos antes de redirigir para mostrar la animación de éxito
      if (mode === "edit") {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Redirigir a la lista de usuarios
      router.push("/dashboard/users")
      router.refresh()
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creando" : "actualizando"} usuario:`, error)
      toast.error(`Error inesperado al ${mode === "create" ? "crear" : "actualizar"} el usuario`)
      setIsSubmitting(false)
    }
  }

  // Usar refs para onSubmit para evitar re-renders infinitos
  const onSubmitRef = React.useRef(onSubmit)
  
  React.useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(form, isSubmitting, (data: any) => onSubmitRef.current(data))
    }
  }, [form, isSubmitting, onFormReady])

  // Actualizar el documento cuando cambia previewUrl
  React.useEffect(() => {
    const currentOnFormChange = onFormChangeRef.current
    if (currentOnFormChange) {
      // Usar un pequeño delay para asegurar que el componente esté montado
      const timer = setTimeout(() => {
        const formValues = formRef.current.getValues()
        currentOnFormChange({
          ...formValues,
          avatar_url: previewUrl || undefined,
        } as any)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [previewUrl])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Imagen del usuario (centrada) */}
        <div className="flex flex-col items-center gap-4">
          <Label>Imagen del Usuario</Label>
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={previewUrl || undefined}
                alt={form.getValues("full_name") || form.getValues("email") || "Usuario"}
              />
              <AvatarFallback className="text-4xl">
                {getInitials(form.getValues("full_name"), form.getValues("email"))}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-background"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              title="Cambiar foto de perfil"
            >
              <Camera className="h-4 w-4" />
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-0 right-0 h-8 w-8 rounded-full border-2 border-background"
                onClick={() => {
                  setPreviewUrl(user?.avatar_url || null)
                  setSelectedFile(null)
                  if (onFormChangeRef.current) {
                    const formValues = formRef.current.getValues()
                    onFormChangeRef.current({
                      ...formValues,
                      avatar_url: user?.avatar_url || null,
                    } as any)
                  }
                }}
                disabled={isSubmitting}
                title="Eliminar imagen"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-sm text-muted-foreground text-center">
            Selecciona una imagen para el perfil del usuario (opcional)
          </p>
        </div>

        {/* Row 2: Empresa y Rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => {
              const currentValue = field.value || ""
              return (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleFormValueChange()
                      }}
                      value={currentValue}
                      disabled={mode === "edit"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.is_parent ? `${company.name} (Matriz)` : company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {mode === "create"
                      ? "La empresa a la que pertenece el usuario"
                      : "La empresa no se puede modificar"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => {
              // Asegurar que siempre haya un valor válido
              const roleValue = (field.value && ["super_admin", "admin", "collaborator"].includes(field.value))
                ? field.value
                : "collaborator"
              
              // Sincronizar el valor si no coincide
              if (field.value !== roleValue) {
                field.onChange(roleValue)
              }
              
              return (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleFormValueChange()
                      }}
                      value={roleValue}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">
                          {roleLabels.super_admin}
                        </SelectItem>
                        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                        <SelectItem value="collaborator">
                          {roleLabels.collaborator}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    El rol determina los permisos del usuario
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>

        {/* Row 3: Email, Nombre completo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    {...field}
                    disabled={mode === "edit"}
                    onChange={(e) => {
                      field.onChange(e)
                      handleFormValueChange()
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {mode === "create"
                    ? "El correo electrónico del usuario"
                    : "El correo electrónico no se puede modificar"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan Pérez"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e)
                      handleFormValueChange()
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Nombre completo del usuario
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Estado (solo en edición) */}
        {mode === "edit" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "true")
                        handleFormValueChange()
                      }}
                      value={field.value ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Los usuarios inactivos no pueden iniciar sesión
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

      </form>
      
      {/* Dialog para recortar imagen */}
      {cropImageSrc && (
        <ImageCropper
          open={isCropDialogOpen}
          onOpenChange={setIsCropDialogOpen}
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </Form>
  )
}

