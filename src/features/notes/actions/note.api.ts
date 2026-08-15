import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"
import { resolveUploadUrl } from "@/features/notes/lib/note-html"

export async function createNote(dto: { content: string; task_id: number }) {
  try {
    const { data } = await api.post<string>("/notes", dto)
    return data
  } catch (error) {
    handleApiError(error, "Error al crear nota")
  }
}

export async function updateNote(noteId: number, content: string) {
  try {
    const { data } = await api.patch<string>(`/notes/${noteId}`, { content })
    return data
  } catch (error) {
    handleApiError(error, "Error al actualizar nota")
  }
}

export async function deleteNote(noteId: number) {
  try {
    const { data } = await api.delete<string>(`/notes/${noteId}`)
    return data
  } catch (error) {
    handleApiError(error, "Error al eliminar nota")
  }
}

export async function uploadImage(file: File, taskId: number): Promise<string | null> {
  try {
    const form = new FormData()
    form.append("file", file)
    form.append("task_id", String(taskId))
    const { data } = await api.post<{ url: string }>("/uploads", form)
    return resolveUploadUrl(data.url)
  } catch (error) {
    handleApiError(error, "Error al subir la imagen")
    return null
  }
}

export async function unfurlLink(
  url: string,
): Promise<{ title: string; icon: string } | null> {
  try {
    const { data } = await api.post<{ title: string; icon: string }>(
      "/links/unfurl",
      { url },
    )
    return { title: data.title, icon: data.icon }
  } catch (error) {
    handleApiError(error, "Error al obtener información del enlace")
    return null
  }
}
