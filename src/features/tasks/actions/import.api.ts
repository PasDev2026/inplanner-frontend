import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"
import type { BackendTask } from "@/features/shared/lib/types"

export interface ImportRowError {
  numeroFila: number
  mensaje: string
}

export interface ImportPreviewRow {
  numeroFila: number
  task_name: string
  nivel: number
  estado: number
}

export interface ImportPreview {
  total: number
  validas: number
  ignoradas: number
  errores: ImportRowError[]
  filas: ImportPreviewRow[]
}

type ImportOptions = { projectId: number; parentTaskId?: number }

function buildImportForm(file: File, options: ImportOptions): FormData {
  const form = new FormData()
  form.append("file", file)
  form.append("project_id", String(options.projectId))
  if (options.parentTaskId !== undefined) {
    form.append("parent_task_id", String(options.parentTaskId))
  }
  return form
}

export async function previewTasksFromFile(
  file: File,
  options: ImportOptions,
): Promise<ImportPreview> {
  try {
    const { data } = await api.post<ImportPreview>(
      "/tasks/import/preview",
      buildImportForm(file, options),
    )
    return data
  } catch (error) {
    handleApiError(error, "Error al analizar el archivo")
  }
}

export async function importTasksFromFile(
  file: File,
  options: ImportOptions,
): Promise<BackendTask[]> {
  try {
    const { data } = await api.post<BackendTask[]>(
      "/tasks/import",
      buildImportForm(file, options),
    )
    return data
  } catch (error) {
    handleApiError(error, "Error al importar actividades")
  }
}

export async function downloadImportTemplate(): Promise<void> {
  try {
    const response = await api.get<Blob>("/tasks/import/template", {
      responseType: "blob",
    })
    const url = URL.createObjectURL(response.data)
    const link = document.createElement("a")
    link.href = url
    link.download = "Plantilla_Importar_Actividades.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    handleApiError(error, "Error al descargar la plantilla")
  }
}
