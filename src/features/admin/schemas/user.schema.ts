import { z } from 'zod'

export const roleSchema = z.object({
  id: z.number(),
  nombre: z.string()
})
export type Role = z.infer<typeof roleSchema>

export const areaSchema = z.object({
  id_area: z.number(),
  nombre_area: z.string()
})
export type Area = z.infer<typeof areaSchema>

export const userAdminSchema = z.object({
  id_user: z.number(),
  name: z.string(),
  apellido_paterno: z.string().nullable(),
  apellido_materno: z.string().nullable(),
  telefono: z.string().nullable(),
  username: z.string(),
  email: z.string(),
  dni: z.string().nullable(),
  userSedes: z.array(z.object({ sede_id: z.number() })).default([]),
  userRoles: z.array(z.object({ rol_id: z.number() })).default([]),
  estado: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  area: areaSchema.nullable().optional(),
})
export type UserAdmin = z.infer<typeof userAdminSchema>

export const userEditSchema = z.object({
  name: z.string(),
  apellido_paterno: z.string(),
  apellido_materno: z.string(),
  telefono: z.string().max(9, 'El teléfono debe tener máximo 9 caracteres').regex(/^\d+$/, 'Solo se permiten números'),
  dni: z.string()
    .max(8, "El DNI debe tener máximo 8 caracteres")
    .regex(/^\d+$/, "El DNI solo permite números")
    .optional(),
  email: z.string().email(),
  username: z.string(),
  area_id: z.string().optional(),
})
export type UserEditForm = z.infer<typeof userEditSchema>

export type UpdateUserProfilePayload = {
  name?: string
  apellido_paterno?: string
  apellido_materno?: string
  telefono?: string
  email?: string
  username?: string
  dni?: string
  sede_ids?: number[]
  rol_ids?: number[]
  area_id?: number
}

export const userCreateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  apellido_paterno: z.string().min(1, "El apellido paterno es obligatorio"),
  apellido_materno: z.string().min(1, "El apellido materno es obligatorio"),
  telefono: z.string().max(9, "Máximo 9 caracteres").regex(/^\d+$/, "Solo se permiten números"),
  dni: z.string()
    .min(1, "El DNI es obligatorio")
    .max(8, "El DNI debe tener máximo 8 caracteres")
    .regex(/^\d+$/, "El DNI solo permite números"),
  username: z.string().min(1, "El username es obligatorio"),
  email: z.string().email("E-mail no válido").optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  area_id: z.string().optional(),
})
export type UserCreateForm = z.infer<typeof userCreateSchema>

export const userFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  apellido_paterno: z.string().min(1, "El apellido paterno es obligatorio"),
  apellido_materno: z.string().min(1, "El apellido materno es obligatorio"),
  telefono: z.string().max(9, 'El teléfono debe tener máximo 9 caracteres').regex(/^\d+$/, 'Solo se permiten números'),
  dni: z.string().max(8, "El DNI debe tener máximo 8 caracteres").regex(/^\d+$/, "El DNI solo permite números").optional(),
  username: z.string().min(1, "El username es obligatorio"),
  email: z.string().email("E-mail no válido").optional().or(z.literal("")),
  password: z.string().min(8, "Mínimo 8 caracteres").optional(),
  area_id: z.string().optional(),
})
export type UserFormData = z.infer<typeof userFormSchema>
