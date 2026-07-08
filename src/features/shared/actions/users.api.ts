import api from "@/features/shared/lib/axios"

export type AvailableUser = {
  id_user: number
  name: string
  apellido_paterno: string | null
  apellido_materno: string | null
}

export async function getAvailableUsers(): Promise<AvailableUser[]> {
  const { data } = await api.get("/users/available")
  return data
}