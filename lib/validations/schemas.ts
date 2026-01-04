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
 * Esquema de validación para creación/actualización de empresa
 */
export const companySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede tener más de 255 caracteres"),
  website: urlSchema,
  logo_url: urlSchema,
  legal_name: z
    .string()
    .min(2, "El nombre legal debe tener al menos 2 caracteres")
    .max(255, "El nombre legal no puede tener más de 255 caracteres")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "La dirección no puede tener más de 500 caracteres")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .min(2, "El país debe tener al menos 2 caracteres")
    .max(100, "El país no puede tener más de 100 caracteres")
    .optional()
    .or(z.literal("")),
})

/**
 * Esquema de validación para creación de empresa
 */
export const createCompanySchema = companySchema

/**
 * Esquema de validación para actualización de empresa
 */
export const updateCompanySchema = companySchema.partial().extend({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede tener más de 255 caracteres")
    .optional(),
})

/**
 * Tipo inferido para configuración de marca
 */
export type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>

/**
 * Tipo inferido para creación de empresa
 */
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>

/**
 * Tipo inferido para actualización de empresa
 */
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>

/**
 * Esquema de validación para creación de usuario
 * Nota: La contraseña se genera automáticamente y se envía por correo
 */
export const createUserSchema = z.object({
  email: emailSchema,
  full_name: fullNameSchema,
  role: z.enum(["super_admin", "admin", "collaborator"], {
    message: "El rol seleccionado no es válido",
  }),
  company_id: z.string().uuid("El ID de la empresa no es válido"),
})

/**
 * Esquema de validación para actualización de usuario
 */
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  full_name: fullNameSchema,
  role: z.enum(["super_admin", "admin", "collaborator"], {
    message: "El rol seleccionado no es válido",
  }).optional(),
  company_id: z.string().uuid("El ID de la empresa no es válido").optional(),
  is_active: z.boolean().optional(),
})

/**
 * Esquema de validación para cambio de contraseña de usuario (por admin)
 */
export const changeUserPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: z.string().min(1, "La confirmación de contraseña es requerida"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
})

/**
 * Tipo inferido para creación de usuario
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Tipo inferido para actualización de usuario
 */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

/**
 * Tipo inferido para cambio de contraseña de usuario
 */
export type ChangeUserPasswordFormData = z.infer<typeof changeUserPasswordSchema>

