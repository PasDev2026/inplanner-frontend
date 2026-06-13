import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
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
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al crear tarea');
    }
    throw new Error('Error al crear tarea');
  }
}

export async function getTaskById(id: number) {
  try {
    const { data } = await api.get<BackendTask>(`/tasks/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al obtener tarea');
    }
    throw new Error('Error al obtener tarea');
  }
}

export async function updateTask(id: number, fields: Partial<BackendTask>) {
  try {
    const { data } = await api.patch<BackendTask>(`/tasks/${id}`, fields);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al actualizar tarea');
    }
    throw new Error('Error al actualizar tarea');
  }
}

export async function deleteTask(id: number) {
  try {
    const { data } = await api.delete<string>(`/tasks/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Ocurrió un error al eliminar la tarea');
    }
    throw new Error('Ocurrió un error al eliminar la tarea');
  }
}

export async function updateTaskStatus(id: number, dto: { status: number; completed_by_id?: number }) {
  try {
    const { data } = await api.patch<BackendTask>(`/tasks/${id}/status`, dto);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al cambiar estado');
    }
    throw new Error('Error al cambiar estado');
  }
}

export async function getTaskChildren(id: number) {
  try {
    const { data } = await api.get<BackendTask[]>(`/tasks/${id}/children`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Error al obtener subtareas');
    }
    throw new Error('Error al obtener subtareas');
  }
}

export async function createAssignment(taskId: number, userId: number) {
  try {
    const { data } = await api.post(`/tasks/${taskId}/assignments`, { user_id: userId });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al asignar usuario');
    }
    throw new Error('Error al asignar usuario');
  }
}

export async function removeAssignment(taskId: number, userId: number) {
  try {
    const { data } = await api.delete(`/tasks/${taskId}/assignments/${userId}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al quitar asignación');
    }
    throw new Error('Error al quitar asignación');
  }
}
