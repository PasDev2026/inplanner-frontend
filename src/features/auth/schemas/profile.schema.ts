import { z } from 'zod'

export const profileFormSchema = z.object({
    name: z.string().min(1, "Nombre de usuario es obligatorio"),
    email: z.string().min(1, "EL e-mail es obligatorio").email("E-mail no válido"),
})
export type UserProfileForm = z.infer<typeof profileFormSchema>
