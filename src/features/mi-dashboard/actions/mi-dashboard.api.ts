import api from "@/features/shared/lib/axios"
import { handleApiError } from "@/features/shared/lib/handle-api-error"

export interface MyTaskCounts {
  total: number
  pending: number
  inProgress: number
  underReview: number
  completed: number
  overdue: number
}

export interface UpcomingDeadlineItem {
  id_task: number
  task_name: string
  due_date: string
  status: number
  priority: number
  project_id: number
  project_name: string
}

export interface MyProjectItem {
  id_project: number
  name_project: string
  status: number
  privacy_level: number
  due_date: string
}

export interface MyProjectProgressItem {
  id_project: number
  name_project: string
  total: number
  completed: number
}

export interface MyWeeklyActivityItem {
  week: string
  created: number
  completed: number
}

export interface MyStats {
  taskCounts: MyTaskCounts
  myProjects: MyProjectItem[]
  projectProgress: MyProjectProgressItem[]
}

export async function fetchMyStats(): Promise<MyStats> {
  try {
    const { data } = await api.get<MyStats>("/dashboard/my-stats")
    return data
  } catch (error) {
    handleApiError(error, "Error al cargar tus estadísticas")
  }
}

export async function fetchMyWeeklyActivity(from: Date, to: Date): Promise<MyWeeklyActivityItem[]> {
  try {
    const { data } = await api.get<MyWeeklyActivityItem[]>("/dashboard/my-weekly-activity", {
      params: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    })
    return data
  } catch (error) {
    handleApiError(error, "Error al cargar tu actividad semanal")
  }
}

export async function fetchMyUpcomingDeadlines(limit: number): Promise<UpcomingDeadlineItem[]> {
  try {
    const { data } = await api.get<UpcomingDeadlineItem[]>("/dashboard/my-upcoming-deadlines", {
      params: { limit },
    })
    return data
  } catch (error) {
    handleApiError(error, "Error al cargar tus próximos vencimientos")
  }
}
