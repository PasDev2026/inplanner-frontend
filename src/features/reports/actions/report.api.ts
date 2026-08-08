import api from "@/features/shared/lib/axios";
import { handleApiError } from "@/features/shared/lib/handle-api-error";
import type { ActivityReportItem, BackendPaginatedResponse } from "@/features/shared/lib/types";

export type ReportFilters = {
  search?: string;
  status?: string;
  priority?: string;
  sede_id?: string;
  responsible_id?: string;
  project_id?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

function buildParams(filters?: ReportFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.sede_id) params.sede_id = filters.sede_id;
  if (filters?.responsible_id) params.responsible_id = filters.responsible_id;
  if (filters?.project_id) params.project_id = filters.project_id;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters?.page !== undefined) params.page = filters.page;
  if (filters?.limit !== undefined) params.limit = filters.limit;
  return params;
}

export async function getReportActivities(filters: ReportFilters) {
  try {
    const { data } = await api.get<BackendPaginatedResponse<ActivityReportItem>>(
      "/reports/activities",
      { params: buildParams(filters) },
    );
    return data;
  } catch (error) {
    handleApiError(error, "Error al cargar el reporte de actividades");
  }
}

export async function exportReportActivities(filters: ReportFilters) {
  try {
    const response = await api.get<Blob>("/reports/activities/export", {
      params: buildParams(filters),
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    const d = new Date()
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    link.download = `actividades_${date}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    handleApiError(error, "Error al exportar el reporte");
  }
}
