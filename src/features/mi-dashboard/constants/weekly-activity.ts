import type { ChartConfig } from "@/components/ui/chart"
import type { MyWeeklyActivityItem } from "@/features/mi-dashboard/actions/mi-dashboard.api"

export const weeklyChartConfig = {
  created: { label: "Creadas", color: "var(--chart-1)" },
  completed: { label: "Completadas", color: "var(--chart-4)" },
} satisfies ChartConfig

export type WeeklyActivityDataPoint = {
  label: string
  created: number
  completed: number
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function defaultWeeklyRange(): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date(to.getTime() - 7 * WEEK_MS)
  return { from, to }
}

export function buildWeeklyActivityData(
  items: MyWeeklyActivityItem[],
  from: Date,
  to: Date,
): WeeklyActivityDataPoint[] {
  const byWeek = new Map(items.map((item) => [item.week.slice(0, 10), item]))
  const start = startOfWeek(from)
  const end = startOfWeek(to)
  const result: WeeklyActivityDataPoint[] = []
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getTime() + WEEK_MS)) {
    const item = byWeek.get(toISODate(cursor))
    result.push({
      label: cursor.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      created: item?.created ?? 0,
      completed: item?.completed ?? 0,
    })
  }
  return result
}
