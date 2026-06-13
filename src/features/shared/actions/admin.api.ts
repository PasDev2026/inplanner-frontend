import api from "@/features/shared/lib/axios";
import type { UserAdmin } from "@/features/admin/schemas/user.schema";

export async function getAllUsers(page: number, limit: number, search?: string) {
  const params = search ? `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}` : `?page=${page}&limit=${limit}`
  const { data } = await api<{ data: UserAdmin[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(`/users${params}`)
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
