import {
  Briefcase, Activity, ClipboardList,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { DashboardStats } from "@/features/dashboard/actions/dashboard.api"

export type StatsCardsProps = Pick<DashboardStats, "projectCounts" | "taskCounts">

export type CardMetaItem = {
  key: string
  label: string
  icon: LucideIcon
  iconColor: string
  bgColor: string
  value: (p: StatsCardsProps) => number
}

export const cardMeta: CardMetaItem[] = [
  { key: "totalProjects",  label: "Proyectos totales",   icon: Briefcase,    iconColor: "text-blue-600 dark:text-blue-400",   bgColor: "bg-blue-500/20 dark:bg-blue-900/30",  value: (p) => p.projectCounts.total },
  { key: "activeProjects", label: "Proyectos activos",   icon: Activity,     iconColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/20 dark:bg-emerald-900/30", value: (p) => p.projectCounts.active },
  { key: "totalTasks",     label: "Tareas totales",      icon: ClipboardList,iconColor: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-500/20 dark:bg-violet-900/30", value: (p) => p.taskCounts.total },
  { key: "completedTasks", label: "Tareas completadas",  icon: CheckCircle2, iconColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/20 dark:bg-green-900/30", value: (p) => p.taskCounts.completed },
  { key: "pendingTasks",   label: "Tareas pendientes",   icon: Clock,        iconColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20 dark:bg-amber-900/30", value: (p) => p.taskCounts.pending },
  { key: "overdueTasks",   label: "Tareas vencidas",     icon: AlertCircle,  iconColor: "text-red-600 dark:text-red-400",     bgColor: "bg-red-500/20 dark:bg-red-900/30", value: (p) => p.taskCounts.overdue },
]
