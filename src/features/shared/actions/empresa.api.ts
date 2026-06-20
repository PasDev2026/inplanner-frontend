import api from "@/features/shared/lib/axios";
import { handleApiError } from "@/features/shared/lib/handle-api-error";
import { Empresa } from "@/features/shared/lib/types/empresa";

export async function getSedes() {
  try {
    const { data } = await api.get<Empresa[]>('/empresas');
    return data;
  } catch (error) {
    handleApiError(error, 'Error al obtener las sedes');
  }
}
