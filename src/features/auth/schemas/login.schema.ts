import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(1, "El nombre de usuario es obligatorio"),
    password: z.string().min(1, "El Password es obligatorio"),
})
export type UserLoginForm = z.infer<typeof loginSchema>
