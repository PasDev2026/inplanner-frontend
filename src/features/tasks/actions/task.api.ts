import api from "@/features/shared/lib/axios";
import { handleApiError } from "@/features/shared/lib/handle-api-error";
import type { BackendTask } from "@/features/shared/lib/types";

export async function createTask(dto: {
  task_name: string;
  task_description?: string;
  project_id: number;
  parent_task_id?: number;
  status?: number;
  priority?: number;
  start_date?: string | null;
  due_date?: string | null;
}) {
  try {
    const { data } = await api.post('/tasks', dto);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al crear tarea');
  }
}

export async function getTaskById(id: number) {
  try {
    const { data } = await api.get<BackendTask>(`/tasks/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener tarea');
  }
}

export async function updateTask(id: number, fields: Partial<BackendTask>) {
  try {
    const { data } = await api.patch<BackendTask>(`/tasks/${id}`, fields);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al actualizar tarea');
  }
}

export async function deleteTask(id: number) {
  try {
    const { data } = await api.delete<string>(`/tasks/${id}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Ocurrió un error al eliminar la tarea');
  }
}

export async function updateTaskStatus(id: number, dto: { status: number; completed_by_id?: string }) {
  try {
    const { data } = await api.patch<BackendTask>(`/tasks/${id}/status`, dto);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al cambiar estado');
  }
}

export async function getTaskChildren(id: number) {
  try {
    const { data } = await api.get<BackendTask[]>(`/tasks/${id}/children`);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener subtareas');
  }
}

export async function createAssignment(taskId: number, userId: string) {
  try {
    const { data } = await api.post(`/tasks/${taskId}/assignments`, { user_id: userId });
    return data;
  } catch (error) {
    handleApiError(error, 'Error al asignar usuario');
  }
}

export async function removeAssignment(taskId: number, userId: string) {
  try {
    const { data } = await api.delete(`/tasks/${taskId}/assignments/${userId}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Error al quitar asignación');
  }
}

export async function reorderTask(dto: { taskId: number; targetStatus?: number; position: number }) {
  try {
    await api.patch('/tasks/reorder', dto);
    return true;
  } catch (error) {
    handleApiError(error, 'Error al reordenar tarea');
    return false;
  }
}
