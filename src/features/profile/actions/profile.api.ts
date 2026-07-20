import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"

// ponytail: updateProfile removed — profile is read-only from centralizado
export async function changePasswordProfile(formData: { password_actual: string; password_nueva: string; repetir_password: string }) {
  try {
    const { data } = await api.patch<{ mensaje: string }>('/auth/password', formData)
    return data
  } catch (error) {
    handleApiError(error, 'Error de conexión con el servidor')
  }
}
