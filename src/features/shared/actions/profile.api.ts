import { isAxiosError } from "axios"
import api from "@/features/shared/lib/axios"

export async function updateProfile(formData: { name?: string; email?: string }) {
  try {
    const { data } = await api.patch<{ message: string }>('/auth/profile', formData)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Error de conexión con el servidor')
  }
}

export async function changePasswordProfile(formData: { current_password: string; new_password: string }) {
  try {
    const { data } = await api.patch<{ message: string }>('/auth/password', formData)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Error de conexión con el servidor')
  }
}
