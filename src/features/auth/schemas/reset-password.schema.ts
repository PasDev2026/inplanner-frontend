import { z } from 'zod'

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
