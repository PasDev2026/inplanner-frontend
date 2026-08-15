import { z } from "zod"

export const noteContentSchema = z
  .string()
  .trim()
  .min(1, "El contenido de la nota es obligatorio")
