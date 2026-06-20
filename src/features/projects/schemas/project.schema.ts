import { z } from "zod"

export const projectFormSchema = z.object({
  name_project: z.string().min(1, "El Titulo del Proyecto es obligatorio"),
  description_project: z.string().min(1, "Una descripción del proyecto es obligatoria"),
  sede_id: z.string().optional(),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
})
export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const addMemberSchema = z.object({
  email: z.string().min(1, "El Email es obligatorio").email("E-mail no válido"),
})
export type TeamMemberFormulario = z.infer<typeof addMemberSchema>
