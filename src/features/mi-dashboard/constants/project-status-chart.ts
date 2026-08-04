import type { ChartConfig } from "@/components/ui/chart"
import type { MyProjectItem } from "@/features/mi-dashboard/actions/mi-dashboard.api"

export const myProjectChartConfig = {
  planning: { label: "Planificación", color: "var(--chart-1)" },
  active: { label: "Activos", color: "var(--chart-2)" },
  onHold: { label: "En espera", color: "var(--chart-3)" },
  completed: { label: "Completados", color: "var(--chart-4)" },
  cancelled: { label: "Cancelados", color: "var(--chart-5)" },
} satisfies ChartConfig

export function buildMyProjectStatusData(projects: MyProjectItem[]) {
  const counts = projects.reduce<Record<number, number>>((acc, project) => {
    acc[project.status] = (acc[project.status] ?? 0) + 1
    return acc
  }, {})

  return [
    { name: "Planificación", value: counts[0] ?? 0, fill: "var(--color-planning)" },
    { name: "Activos", value: counts[1] ?? 0, fill: "var(--color-active)" },
    { name: "En espera", value: counts[2] ?? 0, fill: "var(--color-onHold)" },
    { name: "Completados", value: counts[3] ?? 0, fill: "var(--color-completed)" },
    { name: "Cancelados", value: counts[4] ?? 0, fill: "var(--color-cancelled)" },
  ]
}
