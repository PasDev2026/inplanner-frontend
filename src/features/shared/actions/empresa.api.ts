import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { Empresa } from "@/features/shared/lib/types/empresa";

export async function getSedes() {
  try {
    const token = localStorage.getItem('AUTH_TOKEN');
    const { data } = await api.get<Empresa[]>('/empresas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las sedes');
    }
    throw new Error('Error al obtener las sedes');
  }
}
