export const PROJECTS_KEY = ["projects"] as const
export const PROJECTS_FILTERED_KEY = (filters: Record<string, string | number>, sort?: { field: string; order: string } | null) => ["projects", filters, sort] as const
export const PROJECT_DETAIL_KEY = (id: number | string) => ["editProject", id] as const
export const PROJECT_SEDE_USERS_KEY = (id: number | string) => ["projectSedeUsers", id] as const
export const PROJECT_TASKS_KEY = (id: number | string) => ["projectTasks", id] as const
export const PROJECT_TASKS_ALL = ["projectTasks"] as const
export const PROJECTS_KANBAN_KEY = ["projectsKanban"] as const
