import { useState } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import DateBadge from "@/components/ui/DateBadge"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { fetchMyActivities } from "@/features/mi-dashboard/actions/mi-dashboard.api"
import { MY_ACTIVITIES_KEY } from "@/features/mi-dashboard/lib/mi-dashboard-keys"

const LIMIT_OPTIONS = [10, 25, 50, 100]

const STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  ...Object.entries(TASK_STATUS_MAP).map(([value, info]) => ({
    value,
    label: info.label,
  })),
]

export default function MyActivities() {
  const [status, setStatus] = useState("all")
  const [limit, setLimit] = useState(10)
  const { data, isLoading } = useQuery({
    queryKey: [...MY_ACTIVITIES_KEY, status, limit],
    queryFn: () =>
      fetchMyActivities(status === "all" ? undefined : Number(status), limit),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold">Actividades</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
              <Select.Trigger className="h-8 w-[130px] rounded-lg">
                <Select.Value>
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  {STATUS_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No hay actividades</TableCell>
                  </TableRow>
                ) : (
                  data.map((task) => {
                    const statusInfo = TASK_STATUS_MAP[task.status]
                    return (
                      <TableRow key={task.id_task}>
                        <TableCell className="font-medium">{task.task_name}</TableCell>
                        <TableCell>{task.project_name}</TableCell>
                        <TableCell><Badge className={statusInfo?.style}>{statusInfo?.label ?? task.status}</Badge></TableCell>
                        <TableCell><DateBadge date={task.created_at} /></TableCell>
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
