import { z } from 'zod'

export const departmentTypes = [
  'contabilidad',
  'finanzas',
  'tesoreria',
  'talentos',
  'operaciones'
] as const

export const authSchema = z.object({
    name: z.string(),
    apellido_paterno: z.string(),
    apellido_materno: z.string(),
    telefono: z.string().max(9, 'El teléfono debe tener máximo 9 caracteres').regex(/^\d+$/, 'Solo se permiten números'),
    email: z.string().email(),
    username: z.string(),
    department: z.enum(departmentTypes),
    current_password: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    token: z.string()
})

export const userProfileSchema = authSchema.pick({
    name: true,
    apellido_paterno: true,
    email: true}).extend({
    _id: z.string(),
    dni: z.string().optional(),
    role: z.object({ _id: z.string(), name: z.string() }).optional(),
    area: z.object({ _id: z.string(), name: z.string() }).optional(),
    empresas: z.array(z.object({ _id: z.string(), nombre: z.string() })).default([])
})
export type User = z.infer<typeof userProfileSchema>
