import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import DeadlineBadge from "@/components/ui/DeadlineBadge"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { fetchMyUpcomingDeadlines } from "@/features/mi-dashboard/actions/mi-dashboard.api"
import { MY_UPCOMING_DEADLINES_KEY } from "@/features/mi-dashboard/lib/mi-dashboard-keys"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export default function MyUpcomingTasks() {
  const [limit, setLimit] = useState(10)
  const { data, isLoading } = useQuery({
    queryKey: [...MY_UPCOMING_DEADLINES_KEY, limit],
    queryFn: () => fetchMyUpcomingDeadlines(limit),
    placeholderData: keepPreviousData,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold">Próximos vencimientos</CardTitle>
          <Select value={String(limit)} onValueChange={(v) => { if (v) setLimit(Number(v)); }}>
            <Select.Trigger className="h-8 w-[90px] rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popup>
              <Select.List>
                {LIMIT_OPTIONS.map((opt) => (
                  <Select.Item key={opt} value={String(opt)}>{opt}</Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 py-1">
              {Array.from({ length: Math.min(limit, 10) }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No hay tareas pendientes</TableCell>
                  </TableRow>
                ) : (
                  data.map((task) => {
                    const statusInfo = TASK_STATUS_MAP[task.status]
                    return (
                      <TableRow key={task.id_task}>
                        <TableCell className="font-medium">{task.task_name}</TableCell>
                        <TableCell>{task.project_name}</TableCell>
                        <TableCell>
                          <DeadlineBadge dueDate={task.due_date} isOverdue={new Date(task.due_date) < new Date()} />
                        </TableCell>
                        <TableCell><Badge className={statusInfo?.style}>{statusInfo?.label ?? task.status}</Badge></TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
