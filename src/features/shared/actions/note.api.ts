import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"

export async function createNote(dto: { content: string; task_id: number }) {
  try {
    const { data } = await api.post<string>('/notes', dto)
    return data
  } catch (error) {
    handleApiError(error, 'Error al crear nota')
  }
}

export async function deleteNote(noteId: number) {
  try {
    const { data } = await api.delete<string>(`/notes/${noteId}`)
    return data
  } catch (error) {
    handleApiError(error, 'Error al eliminar nota')
  }
}
