import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"
import type { BackendTask, BackendProject } from "@/features/shared/lib/types"

export interface DashboardStats {
  projectCounts: { total: number; planning: number; active: number; onHold: number; completed: number; cancelled: number }
  taskCounts: { total: number; pending: number; inProgress: number; underReview: number; completed: number; overdue: number }
  tasksByUser: { userId: string; name: string; email: string; pending: number; total: number }[]
  upcomingDeadlines: BackendTask[]
  recentProjects: BackendProject[]
}

export interface MonthlyStats {
  month: number
  year: number
  tasks: { total: number; completed: number }
  projects: { total: number; completed: number }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await api.get<DashboardStats>("/dashboard/stats")
    return data
  } catch (error) {
    handleApiError(error, "Error al cargar estadísticas del dashboard")
  }
}

export async function fetchMonthlyStats(month: number, year: number): Promise<MonthlyStats> {
  const { data } = await api.get("/dashboard/monthly", { params: { month, year } })
  return data
}

export interface BySedeItem {
  sede_id: string
  projects: number
  tasks: number
}

export async function fetchBySedeStats(month: number, year: number): Promise<BySedeItem[]> {
  const { data } = await api.get("/dashboard/by-sede", { params: { month, year } })
  return data
}
