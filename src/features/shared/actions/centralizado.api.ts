import api from "@/features/shared/lib/axios";

export interface CentralizadoItem {
  id: string;
  nombre: string;
}

export interface AreaEntity {
  id_area: number;
  nombre_area: string;
  estado: boolean;
}

export async function getRoles() {
  const { data } = await api.get<{ roles: CentralizadoItem[]; sedes: CentralizadoItem[] }>('/centralizado')
  return data.roles
}

export async function getSedes() {
  const { data } = await api.get<{ roles: CentralizadoItem[]; sedes: CentralizadoItem[] }>('/centralizado')
  return data.sedes
}

export async function getAreas() {
  const { data } = await api.get<{ data: AreaEntity[]; meta: { page: number; limit: number; total: number; totalPages: number } }>('/areas?limit=100&estado=true')
  return data.data
}
