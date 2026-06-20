export const TASK_KEY = (id: number | string) => ["task", String(id)] as const
export const TASK_CHILDREN_KEY = (id: number) => ["taskChildren", id] as const
export const DASHBOARD_TASKS_KEY = (id: number) => ["dashboardProjectTasks", id] as const
export const DASHBOARD_TASKS_ALL = ["dashboardProjectTasks"] as const
