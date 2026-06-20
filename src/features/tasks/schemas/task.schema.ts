import { z } from "zod"

export const taskFormSchema = z.object({
  name: z.string().min(1, "El nombre de la tarea es obligatorio"),
  description: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high"]).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
})
export type TaskFormData = z.infer<typeof taskFormSchema>
