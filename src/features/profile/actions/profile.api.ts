import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"

export async function updateProfile(formData: { name?: string; email?: string }) {
  try {
    const { data } = await api.patch<{ message: string }>('/auth/profile', formData)
    return data
  } catch (error) {
    handleApiError(error, 'Error de conexión con el servidor')
  }
}

export async function changePasswordProfile(formData: { current_password: string; new_password: string }) {
  try {
    const { data } = await api.patch<{ message: string }>('/auth/password', formData)
    return data
  } catch (error) {
    handleApiError(error, 'Error de conexión con el servidor')
  }
}
