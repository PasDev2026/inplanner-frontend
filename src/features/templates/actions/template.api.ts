import api from "@/features/shared/lib/axios";
import { handleApiError } from "@/features/shared/lib/handle-api-error";
import type { BackendTask } from "@/features/shared/lib/types";
import type { TemplateDetail, TemplateItemPayload, TemplateSummary } from "../lib/types";

export async function getTemplates() {
  try {
    const { data } = await api.get<TemplateSummary[]>("/task-templates");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener las plantillas");
  }
}

export async function getAllTemplates() {
  try {
    const { data } = await api.get<TemplateSummary[]>("/task-templates/all");
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener las plantillas");
  }
}

export async function getTemplate(id: number) {
  try {
    const { data } = await api.get<TemplateDetail>(`/task-templates/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al obtener la plantilla");
  }
}

export async function createTemplate(dto: {
  template_name: string;
  items: TemplateItemPayload[];
}) {
  try {
    const { data } = await api.post<TemplateSummary>("/task-templates", dto);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear la plantilla");
  }
}

export async function createTemplateFromTask(dto: {
  task_id: number;
  template_name: string;
}) {
  try {
    const { data } = await api.post<TemplateSummary>("/task-templates/from-task", dto);
    return data;
  } catch (error) {
    handleApiError(error, "Error al crear la plantilla desde la tarea");
  }
}

export async function updateTemplate(
  id: number,
  dto: { template_name?: string; items?: TemplateItemPayload[] },
) {
  try {
    const { data } = await api.patch<TemplateSummary>(`/task-templates/${id}`, dto);
    return data;
  } catch (error) {
    handleApiError(error, "Error al actualizar la plantilla");
  }
}

export async function deleteTemplate(id: number) {
  try {
    const { data } = await api.delete<string>(`/task-templates/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, "Error al eliminar la plantilla");
  }
}

export async function applyTemplate(
  id: number,
  dto: { project_id: number; parent_task_id?: number },
) {
  try {
    const { data } = await api.post<BackendTask[]>(`/task-templates/${id}/apply`, dto);
    return data;
  } catch (error) {
    handleApiError(error, "Error al aplicar la plantilla");
  }
}
