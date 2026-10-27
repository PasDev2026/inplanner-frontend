import type {
  DimensionRisk,
  PredictiveTask,
  RiskDistributionDatum,
  RiskLevel,
  RiskSummary,
  TaskFilters,
  TaskSort,
} from "@/features/ml-dashboard/types"

export const SURFACE_SHADOW =
  "shadow-[0_1px_2px_rgba(15,23,42,0.03),0_18px_40px_-32px_rgba(15,23,42,0.35)]"

type RiskMeta = {
  label: string
  shortLabel: string
  description: string
  badgeClass: string
  dotClass: string
  textClass: string
  barClass: string
  softClass: string
  chartColor: string
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  alto: {
    label: "Riesgo alto",
    shortLabel: "Alto",
    description: "Intervención inmediata",
    badgeClass:
      "border-red-500/20 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
    dotClass: "bg-red-500",
    textClass: "text-red-600 dark:text-red-400",
    barClass: "bg-red-500",
    softClass: "bg-red-500/10",
    chartColor: "hsl(var(--destructive))",
  },
  medio: {
    label: "Riesgo medio",
    shortLabel: "Medio",
    description: "Seguimiento cercano",
    badgeClass:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
    dotClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    barClass: "bg-amber-500",
    softClass: "bg-amber-500/10",
    chartColor: "hsl(var(--warning))",
  },
  bajo: {
    label: "Riesgo bajo",
    shortLabel: "Bajo",
    description: "Monitoreo habitual",
    badgeClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    barClass: "bg-emerald-500",
    softClass: "bg-emerald-500/10",
    chartColor: "hsl(var(--success))",
  },
}

export const RISK_ORDER: RiskLevel[] = ["alto", "medio", "bajo"]

export function riskLevelForProbability(probability: number): RiskLevel {
  if (probability >= 0.58) return "alto"
  if (probability >= 0.45) return "medio"
  return "bajo"
}

export function riskCounts(distribution: RiskDistributionDatum[]): Record<RiskLevel, number> {
  return {
    alto: distribution.find((item) => item.level === "alto")?.count ?? 0,
    medio: distribution.find((item) => item.level === "medio")?.count ?? 0,
    bajo: distribution.find((item) => item.level === "bajo")?.count ?? 0,
  }
}

export function riskPercentage(summary: RiskSummary, level: RiskLevel): number {
  return summary.distribution.find((item) => item.level === level)?.percentage ?? 0
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value)
}

export function formatPercentage(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatProbability(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatDateShortEs(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTimeEs(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "—"
  const datePart = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
  const timePart = new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
  return `${datePart} · ${timePart}`
}

export function daysFromReference(dueDate: string, referenceDate: string): number {
  const [dueYear, dueMonth, dueDay] = dueDate.split("-").map(Number)
  const [refYear, refMonth, refDay] = referenceDate.split("-").map(Number)
  const due = Date.UTC(dueYear, dueMonth - 1, dueDay)
  const reference = Date.UTC(refYear, refMonth - 1, refDay)
  return Math.round((due - reference) / 86_400_000)
}

export type DueDateTone = "overdue" | "soon" | "normal"

export function dueDateLabel(
  dueDate: string,
  referenceDate: string,
): { text: string; tone: DueDateTone } {
  const days = daysFromReference(dueDate, referenceDate)
  if (days < 0) {
    const overdue = Math.abs(days)
    return {
      text: `Vencida hace ${overdue} ${overdue === 1 ? "día" : "días"}`,
      tone: "overdue",
    }
  }
  if (days === 0) return { text: "Vence hoy", tone: "soon" }
  if (days <= 7) return { text: `Vence en ${days} ${days === 1 ? "día" : "días"}`, tone: "soon" }
  return { text: `En ${days} días`, tone: "normal" }
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function filterAndSortTasks(
  tasks: PredictiveTask[],
  filters: TaskFilters,
  sort: TaskSort,
): PredictiveTask[] {
  const search = normalizeText(filters.search)
  const filtered = tasks.filter((task) => {
    if (filters.sede !== "all" && task.sede !== filters.sede) return false
    if (filters.project !== "all" && task.project !== filters.project) return false
    if (filters.risk !== "all" && task.risk !== filters.risk) return false
    if (!search) return true
    return [task.title, task.code, task.project, task.sede, task.owner]
      .map(normalizeText)
      .some((value) => value.includes(search))
  })

  return filtered.sort((a, b) => {
    switch (sort) {
      case "probability_asc":
        return a.probability - b.probability
      case "due_date_asc":
        return a.dueDate.localeCompare(b.dueDate)
      case "project_asc":
        return a.project.localeCompare(b.project, "es")
      case "probability_desc":
      default:
        return b.probability - a.probability
    }
  })
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function dimensionTotal(item: Omit<DimensionRisk, "total">): DimensionRisk {
  return { ...item, total: item.alto + item.medio + item.bajo }
}
