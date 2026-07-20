import { z } from "zod"

export const projectFormSchema = z.object({
  name_project: z.string().min(1, "El Titulo del Proyecto es obligatorio"),
  description_project: z.string().optional(),
  sede_id: z.string().optional(),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  privacy_level: z.string().optional(),
})
export type ProjectFormValues = z.infer<typeof projectFormSchema>
