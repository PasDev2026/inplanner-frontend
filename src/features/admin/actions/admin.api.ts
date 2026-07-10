import api from "@/features/shared/lib/axios";
import type { UserAdmin } from "@/features/admin/schemas/user.schema";

export type UserFilters = {
  search?: string
  estado?: string
  area_id?: string
  rol_id?: string
  sede_id?: string
}

export async function getAllUsers(page: number, limit: number, filters?: UserFilters) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters?.search) params.set('search', filters.search)
  if (filters?.estado) params.set('estado', filters.estado)
  if (filters?.area_id) params.set('area_id', String(filters.area_id))
  if (filters?.rol_id) params.set('rol_id', String(filters.rol_id))
  if (filters?.sede_id) params.set('sede_id', String(filters.sede_id))
  const { data } = await api<{ data: UserAdmin[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(`/users?${params}`)
  return { users: data.data, total: data.meta.total }
}

export async function updateUserStatus(userId: number, estado: boolean) {
  const { data } = await api.patch(`/users/${userId}`, { estado })
  return data
}

export async function updateUserProfileApi(userId: number, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/users/${userId}`, payload)
  return data
}

export async function createUserByAdmin(dto: Record<string, unknown>) {
  const { data } = await api.post('/users', dto)
  return data
}

export async function getUserById(userId: number) {
  const { data } = await api(`/users/${userId}`)
  return data
}

export async function resetUserPassword(userId: number, password: string) {
  const { data } = await api.patch(`/users/${userId}`, { password })
  return data
}
