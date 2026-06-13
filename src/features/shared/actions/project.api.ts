import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { BackendPaginatedResponse, BackendProject } from "@/features/shared/lib/types";

export type ProjectFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sede_id?: number;
  status?: number;
  priority?: number;
  manager_id?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export async function createProject(formData: {
  name_project: string;
  description_project?: string;
  manager_id: number;
  sede_id?: number;
  start_date?: string | null;
  due_date?: string | null;
  status?: number;
  priority?: number;
}) {
  try {
    const { data } = await api.post<BackendProject>('/projects', formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al crear proyecto');
    }
    throw new Error('Error al crear proyecto');
  }
}

export async function getProjects(filters?: ProjectFilters) {
  try {
    const params: Record<string, string | number> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.sede_id !== undefined) params.sede_id = filters.sede_id;
    if (filters?.status !== undefined) params.status = filters.status;
    if (filters?.priority !== undefined) params.priority = filters.priority;
    if (filters?.manager_id !== undefined) params.manager_id = filters.manager_id;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.limit !== undefined) params.limit = filters.limit;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

    const { data } = await api.get<BackendPaginatedResponse<BackendProject>>('/projects', { params });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Error al cargar proyectos');
    }
    throw new Error('Error al cargar proyectos');
  }
}

export async function getProjectById(id: number) {
  try {
    const { data } = await api.get<BackendProject>(`/projects/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Error al obtener proyecto');
    }
    throw new Error('Error al obtener proyecto');
  }
}

export async function updateProjectField(id: number, fields: Partial<BackendProject>) {
  try {
    const { data } = await api.patch<BackendProject>(`/projects/${id}`, fields);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al actualizar proyecto');
    }
    throw new Error('Error al actualizar proyecto');
  }
}

export async function deleteProject(id: number) {
  try {
    const { data } = await api.delete<string>(`/projects/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Ocurrió un error al eliminar el proyecto');
    }
    throw new Error('Ocurrió un error al eliminar el proyecto');
  }
}

export async function getProjectTasks(projectId: number) {
  try {
    const { data } = await api.get(`/tasks`, { params: { project_id: projectId } });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Error al cargar tareas');
    }
    throw new Error('Error al cargar tareas');
  }
}

export async function createResponsible(projectId: number, userId: number) {
  try {
    const { data } = await api.post(`/projects/${projectId}/responsibles`, { user_id: userId });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al asignar responsable');
    }
    throw new Error('Error al asignar responsable');
  }
}

export async function getResponsibles(projectId: number) {
  try {
    const { data } = await api.get(`/projects/${projectId}/responsibles`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error('Error al obtener responsables');
    }
    throw new Error('Error al obtener responsables');
  }
}

export async function removeResponsible(projectId: number, userId: number) {
  try {
    const { data } = await api.delete(`/projects/${projectId}/responsibles/${userId}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message ?? 'Error al quitar responsable');
    }
    throw new Error('Error al quitar responsable');
  }
}
