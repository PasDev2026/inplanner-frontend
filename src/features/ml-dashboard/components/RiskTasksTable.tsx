import {
  ArrowDownUp,
  ChevronRight,
  RotateCcw,
  Search,
  SearchX,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/features/shared/lib/utils"
import ProbabilityBar from "@/features/ml-dashboard/components/ProbabilityBar"
import RiskBadge from "@/features/ml-dashboard/components/RiskBadge"
import {
  dueDateLabel,
  formatDateShortEs,
  formatNumber,
  initials,
  SURFACE_SHADOW,
} from "@/features/ml-dashboard/lib/risk"
import type {
  PredictiveTask,
  RiskLevel,
  TaskFilters,
  TaskSort,
} from "@/features/ml-dashboard/types"

type SampleCounts = Record<RiskLevel, number> & { total: number }

type RiskTasksTableProps = {
  tasks: PredictiveTask[]
  totalSample: number
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  sort: TaskSort
  onSortChange: (sort: TaskSort) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  counts: SampleCounts
  filterOptions: {
    sedes: string[]
    projects: string[]
  }
  referenceDate: string
  onSelectTask: (task: PredictiveTask) => void
}

const SORT_OPTIONS: { value: TaskSort; label: string }[] = [
  { value: "probability_desc", label: "Mayor probabilidad" },
  { value: "probability_asc", label: "Menor probabilidad" },
  { value: "due_date_asc", label: "Vencimiento próximo" },
  { value: "project_asc", label: "Proyecto A–Z" },
]

type FilterOption = {
  value: string
  label: string
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: FilterOption[]
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onValueChange(nextValue)
      }}
    >
      <Select.Trigger
        aria-label={label}
        className="h-9 w-full shrink-0 justify-between whitespace-nowrap rounded-lg border-border bg-card px-3 text-xs shadow-sm lg:w-[180px]"
      >
        <Select.Value>
          {(selected) =>
            options.find((option) => option.value === String(selected))?.label ?? ""
          }
        </Select.Value>
      </Select.Trigger>
      <Select.Popup>
        <Select.List>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popup>
    </Select>
  )
}

export default function RiskTasksTable({
  tasks,
  totalSample,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  counts,
  filterOptions,
  referenceDate,
  onSelectTask,
}: RiskTasksTableProps) {
  const highRiskCount = counts.alto
  const hasResults = tasks.length > 0
  const sedeOptions: FilterOption[] = [
    { value: "all", label: "Todas las sedes" },
    ...filterOptions.sedes.map((sede) => ({ value: sede, label: sede })),
  ]
  const projectOptions: FilterOption[] = [
    { value: "all", label: "Todos los proyectos" },
    ...filterOptions.projects.map((project) => ({ value: project, label: project })),
  ]
  const riskOptions: FilterOption[] = [
    { value: "all", label: `Todos (${counts.total})` },
    { value: "alto", label: `Alto (${counts.alto})` },
    { value: "medio", label: `Medio (${counts.medio})` },
    { value: "bajo", label: `Bajo (${counts.bajo})` },
  ]

  return (
    <Card className={cn("overflow-hidden border-border/70", SURFACE_SHADOW)}>
      <CardHeader className="gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              Tareas priorizadas
            </CardTitle>
            <CardDescription className="text-xs">
              Muestra operativa de {totalSample} tareas · los KPIs agregados usan{" "}
              <span className="font-medium text-foreground">627</span>.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-border/70 bg-muted/40 text-[10px] font-medium text-muted-foreground"
            >
              Muestra {totalSample}
            </Badge>
            <Badge
              variant="outline"
              className="border-red-500/20 bg-red-500/10 text-[10px] font-semibold text-red-700 dark:text-red-300"
            >
              {highRiskCount} en riesgo alto
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative min-w-0 flex-1 lg:min-w-[230px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({ ...filters, search: event.target.value })
              }
              placeholder="Buscar tarea, proyecto, sede o responsable…"
              aria-label="Buscar tareas priorizadas"
              className="h-9 rounded-lg border-border bg-card pl-9 pr-8 text-xs shadow-sm"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <FilterSelect
            label="Filtrar por sede"
            value={filters.sede}
            onValueChange={(value) => onFiltersChange({ ...filters, sede: value })}
            options={sedeOptions}
          />

          <FilterSelect
            label="Filtrar por proyecto"
            value={filters.project}
            onValueChange={(value) => onFiltersChange({ ...filters, project: value })}
            options={projectOptions}
          />

          <FilterSelect
            label="Filtrar por riesgo"
            value={filters.risk}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, risk: value as TaskFilters["risk"] })
            }
            options={riskOptions}
          />

          <div className="flex items-center gap-2">
            <Select
              value={sort}
              onValueChange={(nextValue) => {
                if (typeof nextValue === "string") onSortChange(nextValue as TaskSort)
              }}
            >
              <Select.Trigger
                aria-label="Ordenar tareas"
                className="h-9 w-full shrink-0 justify-between whitespace-nowrap rounded-lg border-border bg-card px-3 text-xs shadow-sm lg:w-[180px]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select.Value>
                    {(selected) =>
                      SORT_OPTIONS.find((option) => option.value === String(selected))?.label ?? ""
                    }
                  </Select.Value>
                </span>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  {SORT_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!hasResults ? (
          <Empty className="border-0 py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No hay tareas con estos filtros</EmptyTitle>
              <EmptyDescription>
                Ajusta la búsqueda o limpia los filtros para volver a ver la muestra
                priorizada.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-1">
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-9 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Tarea
                  </TableHead>
                  <TableHead className="hidden h-9 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:table-cell">
                    Sede
                  </TableHead>
                  <TableHead className="hidden h-9 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:table-cell">
                    Responsable
                  </TableHead>
                  <TableHead className="h-9 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Vence
                  </TableHead>
                  <TableHead className="h-9 w-[170px] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Probabilidad
                  </TableHead>
                  <TableHead className="h-9 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Riesgo
                  </TableHead>
                  <TableHead className="h-9 w-8 px-2">
                    <span className="sr-only">Abrir detalle</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const due = dueDateLabel(task.dueDate, referenceDate)

                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="group cursor-pointer border-border/50 transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="max-w-[460px] px-4 py-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onSelectTask(task)
                          }}
                          className="flex w-full flex-col items-start gap-0.5 text-left"
                        >
                          <span className="line-clamp-1 font-medium text-foreground transition-colors group-hover:text-brand-primary">
                            {task.title}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-mono">{task.code}</span>
                            <span className="text-border">·</span>
                            <span className="truncate">{task.project}</span>
                          </span>
                        </button>
                      </TableCell>

                      <TableCell className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {task.sede}
                      </TableCell>

                      <TableCell className="hidden px-4 py-3 xl:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                            {initials(task.owner)}
                          </span>
                          <span className="truncate text-xs text-foreground">{task.owner}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-foreground">
                            {formatDateShortEs(task.dueDate)}
                          </span>
                          <span
                            className={cn(
                              "text-[10px]",
                              due.tone === "overdue" && "font-medium text-red-600 dark:text-red-400",
                              due.tone === "soon" && "font-medium text-amber-600 dark:text-amber-400",
                              due.tone === "normal" && "text-muted-foreground",
                            )}
                          >
                            {due.text}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <ProbabilityBar value={task.probability} level={task.risk} />
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <RiskBadge level={task.risk} />
                      </TableCell>

                      <TableCell className="px-2 py-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span aria-live="polite">
            Mostrando <span className="font-medium text-foreground">{formatNumber(tasks.length)}</span>{" "}
            de {formatNumber(totalSample)} tareas de la muestra.
          </span>
          <span>
            Tareas sintéticas · sedes y responsables reales · bandas operativas sobre el score ·
            no es el modelo productivo.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
