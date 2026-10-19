import api from "@/features/shared/lib/axios";
import { handleApiError } from "@/features/shared/lib/handle-api-error";
import type { UserAdmin } from "@/features/admin/schemas/user.schema";

export type UserFilters = {
  search?: string
  estado?: string
  area_id?: string
  sede_id?: string
}

export type UserAssignment = {
  sede_uuid: string
  rol_uuid: string
  especialidad_uuids: string[]
}

export type CreateUserPayload = {
  tipo_documento_uuid: string
  numero_documento: string
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  fecha_nacimiento: string
  sexo: string
  email: string
  telefono?: string
  direccion?: string
  password: string
  repetir_password: string
  area_id?: number
  asignaciones: { sede_uuid: string; rol_uuid: string }[]
}

export type TipoDocumentoItem = {
  uuid_tipo_documento: string
  nombre: string
  codigo: string
}

export type SunatDniResult = {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
}

export async function getAllUsers(page: number, limit: number, filters?: UserFilters) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters?.search) params.set('search', filters.search)
  if (filters?.estado) params.set('estado', filters.estado)
  if (filters?.area_id) params.set('area_id', filters.area_id)
  if (filters?.sede_id) params.set('sede_id', filters.sede_id)
  const { data } = await api<{ data: UserAdmin[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(`/users?${params}`)
  return { users: data.data, total: data.meta.total }
}

export async function createUser(payload: CreateUserPayload) {
  try {
    const { data } = await api.post<UserAdmin>('/users', payload)
    return data
  } catch (error) {
    handleApiError(error, 'Error al crear el usuario')
  }
}

export async function getTiposDocumento() {
  try {
    const { data } = await api.get<TipoDocumentoItem[]>('/centralizado/tipos-documento')
    return data
  } catch (error) {
    handleApiError(error, 'Error al cargar los tipos de documento')
  }
}

export async function searchDni(document: string) {
  try {
    const { data } = await api.get<SunatDniResult>('/centralizado/sunat/dni', {
      params: { document },
    })
    return data
  } catch (error) {
    handleApiError(error, 'Error al consultar el DNI')
  }
}

export async function updateUserStatus(userId: string, estado: boolean) {
  const { data } = await api.patch(`/users/${userId}`, { estado })
  return data
}

export async function updateUserProfileApi(
  userId: string,
  payload: {
    area_id?: string
    estado?: boolean
    asignaciones?: UserAssignment[]
  },
) {
  const { data } = await api.patch(`/users/${userId}`, payload)
  return data
}

export async function getUserById(userId: string) {
  const { data } = await api(`/users/${userId}`)
  return data
}

export async function getUserAssignments(userId: string) {
  const { data } = await api<{ asignaciones: UserAssignment[] }>(
    `/centralizado/trabajadores/${userId}`,
  )
  return data.asignaciones
}
