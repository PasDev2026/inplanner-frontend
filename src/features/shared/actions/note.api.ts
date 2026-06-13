import { isAxiosError } from "axios"
import api from "@/features/shared/lib/axios"

export async function createNote(dto: { content: string; task_id: number }) {
  try {
    const { data } = await api.post<string>('/notes', dto)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al crear nota')
    }
    throw new Error('Error al crear nota')
  }
}

export async function deleteNote(noteId: number) {
  try {
    const { data } = await api.delete<string>(`/notes/${noteId}`)
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al eliminar nota')
    }
    throw new Error('Error al eliminar nota')
  }
}
