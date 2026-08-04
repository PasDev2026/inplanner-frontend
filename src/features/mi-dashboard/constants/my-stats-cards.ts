import { Briefcase, CheckCircle2, ClipboardList, Clock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { MyTaskCounts } from "@/features/mi-dashboard/actions/mi-dashboard.api"

export type MyStatsCardsProps = {
  taskCounts: MyTaskCounts
}

export type MyCardMetaItem = {
  key: string
  label: string
  icon: LucideIcon
  iconColor: string
  bgColor: string
  value: (d: MyTaskCounts) => number
}

export const myCardMeta: MyCardMetaItem[] = [
  { key: "total", label: "Tareas totales", icon: ClipboardList, iconColor: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-500/20 dark:bg-violet-900/30", value: (d) => d.total },
  { key: "pending", label: "Pendientes", icon: Clock, iconColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20 dark:bg-amber-900/30", value: (d) => d.pending },
  { key: "inProgress", label: "En progreso", icon: Briefcase, iconColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/20 dark:bg-blue-900/30", value: (d) => d.inProgress },
  { key: "completed", label: "Completadas", icon: CheckCircle2, iconColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/20 dark:bg-green-900/30", value: (d) => d.completed },
]
