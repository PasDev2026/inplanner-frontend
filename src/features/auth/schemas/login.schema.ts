import { z } from 'zod'

export const loginSchema = z.object({
    numero_documento: z.string().min(1, "El número de documento es obligatorio"),
    password: z.string().min(1, "La contraseña es obligatoria"),
})
export type UserLoginForm = z.infer<typeof loginSchema>
