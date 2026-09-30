import { z } from 'zod'

export const createUserAssignmentSchema = z.object({
  sede_uuid: z.string().min(1, 'Selecciona una sede'),
  rol_uuid: z.string().min(1, 'Selecciona un rol'),
})

export const createUserSchema = z
  .object({
    tipo_documento_uuid: z.string().min(1, 'Selecciona el tipo de documento'),
    numero_documento: z
      .string()
      .min(1, 'El número de documento es requerido')
      .max(20, 'Máximo 20 caracteres'),
    nombres: z.string().min(1, 'Los nombres son requeridos').max(100),
    apellido_paterno: z
      .string()
      .min(1, 'El apellido paterno es requerido')
      .max(100),
    apellido_materno: z.string().max(100).optional().or(z.literal('')),
    fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
    sexo: z.enum(['M', 'F'], { message: 'Selecciona el sexo' }),
    email: z.string().email('Email inválido'),
    telefono: z.string().max(20).optional().or(z.literal('')),
    direccion: z.string().max(300).optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        'Debe tener mayúscula, minúscula, número y carácter especial',
      ),
    repetir_password: z.string().min(8, 'Mínimo 8 caracteres'),
    area_id: z.string().optional(),
    asignaciones: z
      .array(createUserAssignmentSchema)
      .min(1, 'Agrega al menos una asignación'),
  })
  .refine((data) => data.password === data.repetir_password, {
    message: 'Las contraseñas no coinciden',
    path: ['repetir_password'],
  })

export type CreateUserForm = z.infer<typeof createUserSchema>
