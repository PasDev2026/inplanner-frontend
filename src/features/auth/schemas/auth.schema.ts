import { z } from 'zod'

export const departmentTypes = [
  'contabilidad',
  'finanzas',
  'tesoreria',
  'talentos',
  'operaciones'
] as const

/* Auth */
export const authSchema = z.object({
    name: z.string(),
    apellido_paterno: z.string(),
    apellido_materno: z.string(),
    telefono: z.string().max(9, 'El teléfono debe tener máximo 9 caracteres').regex(/^\d+$/, 'Solo se permiten números'),
    email: z.string().email(),
    username: z.string(),
    department: z.enum(departmentTypes),
    current_password: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    token: z.string()
})
export const loginSchema = z.object({
    username: z.string().min(1, "El nombre de usuario es obligatorio"),
    password: z.string().min(1, "El Password es obligatorio"),
})
export type UserLoginForm = z.infer<typeof loginSchema>

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Debe tener al menos 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma la contraseña"),
}).refine(data => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
})
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const checkPasswordSchema = z.object({
    password: z.string().min(1, "El password es obligatorio"),
})
export type CheckPasswordForm = z.infer<typeof checkPasswordSchema>

export const updateCurrentUserPasswordSchema = z.object({
    current_password: z.string().min(1, "El password actual es obligatorio"),
    password: z.string().min(8, "El Password debe ser mínimo de 8 caracteres"),
    password_confirmation: z.string().min(1, "Este campo es obligatorio"),
}).refine(data => data.password === data.password_confirmation, {
    message: "Los Passwords no son iguales",
    path: ["password_confirmation"],
})
export type UpdateCurrentUserPasswordForm = z.infer<typeof updateCurrentUserPasswordSchema>

export const profileFormSchema = z.object({
    name: z.string().min(1, "Nombre de usuario es obligatorio"),
    email: z.string().min(1, "EL e-mail es obligatorio").email("E-mail no válido"),
})
export type UserProfileForm = z.infer<typeof profileFormSchema>

export const userProfileSchema = authSchema.pick({
    name: true,
    apellido_paterno: true,
    email: true}).extend({
    _id: z.string(),
    dni: z.string().optional(),
    role: z.object({ _id: z.string(), name: z.string() }).optional(),
    area: z.object({ _id: z.string(), name: z.string() }).optional(),
    empresas: z.array(z.object({ _id: z.string(), nombre: z.string() })).default([])
})
export type User = z.infer<typeof userProfileSchema>