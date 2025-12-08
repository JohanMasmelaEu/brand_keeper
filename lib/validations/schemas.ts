/**
 * Esquemas de validación reutilizables con Zod
 * Centraliza todas las validaciones de formularios de la aplicación
 */

import { z } from "zod"

/**
 * Esquema de validación para email
 */
export const emailSchema = z
  .string()
  .min(1, "El correo electrónico es requerido")
  .email("El correo electrónico no es válido")

/**
 * Esquema de validación para contraseña
 */
export const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(100, "La contraseña no puede tener más de 100 caracteres")

/**
 * Esquema de validación para nombre completo
 */
export const fullNameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede tener más de 100 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios")

/**
 * Esquema de validación para teléfono
 */
export const phoneSchema = z
  .string()
  .min(10, "El teléfono debe tener al menos 10 dígitos")
  .max(20, "El teléfono no puede tener más de 20 caracteres")
  .regex(/^[\d\s\-\+\(\)]+$/, "El teléfono contiene caracteres inválidos")
  .optional()

/**
 * Esquema de validación para URL
 */
export const urlSchema = z
  .string()
  .url("La URL no es válida")
  .optional()
  .or(z.literal(""))

/**
 * Esquema de validación para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

/**
 * Esquema de validación para registro de usuario
 */
export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone: phoneSchema,
  role: z.enum(["super_admin", "admin", "collaborator"], {
    message: "El rol seleccionado no es válido",
  }),
  company_id: z.string().uuid("El ID de la empresa no es válido").optional(),
})

/**
 * Esquema de validación para actualización de perfil
 */
export const updateProfileSchema = z.object({
  full_name: fullNameSchema.optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  avatar_url: urlSchema,
})

/**
 * Esquema de validación para cambio de contraseña
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

/**
 * Esquema de validación para configuración de marca
 */
export const brandSettingsSchema = z.object({
  company_id: z.string().uuid("El ID de la empresa no es válido"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color primario debe ser un código hexadecimal válido"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "El color secundario debe ser un código hexadecimal válido").optional(),
  logo_url: urlSchema,
  font_family: z.string().min(1, "La fuente es requerida").optional(),
})

/**
 * Tipo inferido para login
 */
export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Tipo inferido para registro de usuario
 */
export type RegisterUserFormData = z.infer<typeof registerUserSchema>

/**
 * Tipo inferido para actualización de perfil
 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

/**
 * Tipo inferido para cambio de contraseña
 */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

/**
 * Tipo inferido para configuración de marca
 */
export type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>

