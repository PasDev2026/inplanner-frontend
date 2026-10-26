import api from "@/features/shared/lib/axios"
import { downloadBlob } from "@/features/shared/lib/download"
import { handleApiError } from "@/features/shared/lib/handle-api-error"
import type { BackendTask } from "@/features/shared/lib/types"

export interface ImportRowError {
  numeroFila: number
  mensaje: string
}

export interface ImportRowWarning {
  numeroFila: number
  mensaje: string
}

export type ImportAction = "crear" | "actualizar" | "omitir"

export type ImportChange =
  | "name"
  | "description"
  | "startDate"
  | "dueDate"
  | "status"
  | "parent"
  | "responsibles"

export interface ImportPreviewRow {
  numeroFila: number
  existing_task_id?: number
  task_name: string
  task_description?: string
  nivel: number
  start_date?: string
  due_date?: string
  responsables?: string[]
  estado: number
  accion: ImportAction
  cambios: ImportChange[]
}

export interface ImportPreview {
  total: number
  validas: number
  creadas: number
  actualizadas: number
  omitidas: number
  ignoradas: number
  errores: ImportRowError[]
  avisos: ImportRowWarning[]
  filas: ImportPreviewRow[]
}

export interface ImportResult {
  creadas: number
  actualizadas: number
  omitidas: number
  tareas: BackendTask[]
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
): Promise<ImportResult> {
  try {
    const { data } = await api.post<ImportResult>(
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
    downloadBlob(response.data, "Plantilla_Importar_Actividades.xlsx")
  } catch (error) {
    handleApiError(error, "Error al descargar la plantilla")
  }
}
