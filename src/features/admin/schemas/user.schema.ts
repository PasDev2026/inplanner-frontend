import { z } from 'zod'

export const areaSchema = z.object({
  id_area: z.number(),
  nombre_area: z.string()
})
export type Area = z.infer<typeof areaSchema>

export const userAdminSchema = z.object({
  id_user: z.string(),
  name: z.string(),
  apellido_paterno: z.string().nullable(),
  apellido_materno: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string(),
  estado: z.boolean(),
  numero_documento: z.string().nullable(),
  sede_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  area: areaSchema.nullable().optional(),
})
export type UserAdmin = z.infer<typeof userAdminSchema>

export const userEditSchema = z.object({
  name: z.string(),
  apellido_paterno: z.string(),
  // ponytail: apellido_materno comentado — pendiente de sync desde centralizado vía JWT
  // apellido_materno: z.string(),
  // ponytail: telefono comentado — pendiente de sync desde centralizado vía JWT
  // telefono: z.string().max(9, 'El teléfono debe tener máximo 9 caracteres').regex(/^\d+$/, 'Solo se permiten números'),
  email: z.string().email(),
  area_id: z.string().optional(),
})
export type UserEditForm = z.infer<typeof userEditSchema>
