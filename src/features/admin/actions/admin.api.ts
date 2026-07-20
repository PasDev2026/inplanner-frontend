import api from "@/features/shared/lib/axios";
import type { UserAdmin } from "@/features/admin/schemas/user.schema";

export type UserFilters = {
  search?: string
  estado?: string
  area_id?: string
  sede_id?: string
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

export async function updateUserStatus(userId: string, estado: boolean) {
  const { data } = await api.patch(`/users/${userId}`, { estado })
  return data
}

export async function updateUserProfileApi(userId: string, payload: { area_id?: string; estado?: boolean }) {
  const { data } = await api.patch(`/users/${userId}`, payload)
  return data
}

export async function getUserById(userId: string) {
  const { data } = await api(`/users/${userId}`)
  return data
}
