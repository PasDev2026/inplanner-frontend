import { BarChart3, SearchX } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import StatusColumnFilter from "@/features/shared/components/StatusColumnFilter"
import PriorityColumnFilter from "@/features/shared/components/PriorityColumnFilter"
import ResponsibleColumnFilter from "@/features/shared/components/ResponsibleColumnFilter"
import ProjectColumnFilter from "@/features/shared/components/ProjectColumnFilter"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import type { ActivityReportItem } from "@/features/shared/lib/types"

function formatDate(iso: string | null): string {
  if (!iso) return "-"
  const [y, m, d] = iso.slice(0, 10).split("-")
  if (!y || !m || !d) return "-"
  return `${d}/${m}/${y}`
}

function ResponsibleCell({ assignments }: { assignments?: ActivityReportItem["assignments"] }) {
  const list = assignments ?? []
  const first = list[0]
  if (!first) return <TableCell>-</TableCell>
  return (
    <TableCell>
      <div className="flex items-center gap-1.5">
        <span className="truncate max-w-[160px]">
          {first.name ?? ""} {first.apellido_paterno ?? ""}
        </span>
        {list.length > 1 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            +{list.length - 1}
          </span>
        )}
      </div>
    </TableCell>
  )
}

interface ReportsTableProps {
  activities: ActivityReportItem[]
  isLoading: boolean
  isFetching: boolean
  hasActiveFilters: boolean
  searchTerm: string
  statusSelected: string[]
  onStatusFilter: (values: string[]) => void
  prioritySelected: number[]
  onPriorityFilter: (values: number[]) => void
  responsibleSelected: string[]
  onResponsibleFilter: (ids: string[]) => void
  projectSelected: number[]
  onProjectFilter: (ids: number[]) => void
}

export function ReportsTable({
  activities,
  isLoading,
  isFetching,
  hasActiveFilters,
  searchTerm,
  statusSelected,
  onStatusFilter,
  prioritySelected,
  onPriorityFilter,
  responsibleSelected,
  onResponsibleFilter,
  projectSelected,
  onProjectFilter,
}: ReportsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : activities.length === 0 && !hasActiveFilters ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3 />
              </EmptyMedia>
              <EmptyTitle>No hay actividades aún</EmptyTitle>
              <EmptyDescription>
                Crea tareas en tus proyectos para que aparezcan aquí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : activities.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyDescription>
                No se encontraron actividades
                {searchTerm && <> para <strong>&quot;{searchTerm}&quot;</strong></>}
                {" "}con los filtros aplicados
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>
                    {/* Filtros de Estado y Prioridad deshabilitados temporalmente en el reporte:
                        se sustituyen por el filtro de Proyecto. Se conservan componentes y estado
                        para reactivarlos quitando el <span> con pointer-events-none y el
                        [&_button]:text-foreground. */}
                    <span className="pointer-events-none inline-block [&_button]:text-foreground">
                      <StatusColumnFilter
                        variant="task"
                        selected={statusSelected}
                        onChange={onStatusFilter}
                      />
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="pointer-events-none inline-block [&_button]:text-foreground">
                      <PriorityColumnFilter
                        selected={prioritySelected}
                        onChange={onPriorityFilter}
                      />
                    </span>
                  </TableHead>
                  <TableHead>Fecha inicio</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>
                    <ResponsibleColumnFilter
                      selected={responsibleSelected}
                      onChange={onResponsibleFilter}
                    />
                  </TableHead>
                  <TableHead>
                    <ProjectColumnFilter
                      selected={projectSelected}
                      onChange={onProjectFilter}
                    />
                  </TableHead>
                  <TableHead>Venc. proyecto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => {
                  const taskStatus = TASK_STATUS_MAP[activity.status]
                  return (
                    <TableRow key={activity.id_task}>
                      <TableCell className="font-medium">{activity.task_name}</TableCell>
                      <TableCell>
                        <Badge className={taskStatus?.style}>{taskStatus?.label ?? activity.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={activity.priority} />
                      </TableCell>
                      <TableCell>{formatDate(activity.start_date)}</TableCell>
                      <TableCell>{formatDate(activity.due_date)}</TableCell>
                      <ResponsibleCell assignments={activity.assignments} />
                      <TableCell>{activity.project_name}</TableCell>
                      <TableCell>{formatDate(activity.project_due_date)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
