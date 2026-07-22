import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DeadlineBadge from "@/components/ui/DeadlineBadge"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import type { BackendTask } from "@/features/shared/lib/types"

type UpcomingTasksProps = {
  tasks: (BackendTask & { project?: { name_project: string } })[]
}

export default function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Próximos vencimientos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-y-auto">
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
            {tasks.length === 0 ? (
              <TableRow className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay tareas próximas a vencer
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {
                const statusInfo = TASK_STATUS_MAP[task.status]
                return (
                  <TableRow key={task.id_task} className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{task.task_name}</TableCell>
                    <TableCell>{task.project?.name_project ?? "-"}</TableCell>
                    <TableCell>
                      <DeadlineBadge dueDate={task.due_date} />
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo?.style}>{statusInfo?.label ?? task.status}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  )
}
