import type { ChartConfig } from "@/components/ui/chart"
import type { MyTaskCounts } from "@/features/mi-dashboard/actions/mi-dashboard.api"

export const myTaskChartConfig = {
  pending: { label: "Pendientes", color: "var(--chart-1)" },
  inProgress: { label: "En progreso", color: "var(--chart-2)" },
  underReview: { label: "En revisión", color: "var(--chart-3)" },
  completed: { label: "Completadas", color: "var(--chart-4)" },
  overdue: { label: "Vencidas", color: "var(--chart-5)" },
} satisfies ChartConfig

export function buildMyTaskStatusData(taskCounts: MyTaskCounts) {
  return [
    { name: "Pendientes", value: taskCounts.pending, fill: "var(--color-pending)" },
    { name: "En progreso", value: taskCounts.inProgress, fill: "var(--color-inProgress)" },
    { name: "En revisión", value: taskCounts.underReview, fill: "var(--color-underReview)" },
    { name: "Completadas", value: taskCounts.completed, fill: "var(--color-completed)" },
    { name: "Vencidas", value: taskCounts.overdue, fill: "var(--color-overdue)" },
  ]
}
