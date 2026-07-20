import { useState, useMemo, useCallback } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskColumn from "./TaskColumn"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECTS_KEY, PROJECT_DETAIL_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { reorderTask } from "@/features/tasks/actions/task.api"
import { toast } from "sonner"
import { useParams } from "react-router-dom"
import { LayoutGrid } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import { statusColors } from "@/features/shared/constants/task-status.constant"

type TaskListProps = {
  tasks: BackendTask[]
  canEdit: boolean
}

type GroupedTask = {
  [key: string]: BackendTask[]
}

const STATUS_KEYS = ["0", "1", "2", "3", "4"]
const STATUS_NAMES = ["pending", "onHold", "inProgress", "underReview", "completed"] as const

export default function TaskList({ tasks, canEdit }: TaskListProps) {
  const params = useParams()
  const projectId = Number(params.projectId!)
  const queryClient = useQueryClient()
  const [activeTask, setActiveTask] = useState<BackendTask | null>(null)

  const groupedTasks: GroupedTask = useMemo(() => {
    const rootTasks = tasks.filter(task => !task.parent_task_id)
    return STATUS_KEYS.reduce((acc, key) => {
      acc[key] = rootTasks.filter(t => (t.status ?? 0) === Number(key))
      return acc
    }, {} as GroupedTask)
  }, [tasks])

  const reorderMutation = useMutation({
    mutationFn: async ({ taskId, targetStatus, position }: { taskId: number; targetStatus: number; position: number }) => {
      const result = await reorderTask({ taskId, targetStatus, position })
      if (!result) throw new Error("No data")
      return result
    },
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_DETAIL_KEY(projectId) })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
    },
  })

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const taskId = e.active.id.toString()
    const task = tasks.find(t => t.id_task.toString() === taskId)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveTask(null)
    const { over, active, collisions } = e
    if (!over?.id) return

    const taskId = Number(active.id.toString())

    const taskCollision = collisions?.find(c =>
      !['0','1','2','3','4'].includes(String(c.id)))
    if (taskCollision) {
      const overTaskId = Number(taskCollision.id)
      const activeTask = tasks.find(t => t.id_task === taskId)
      const overTask = tasks.find(t => t.id_task === overTaskId)
      if (!activeTask || !overTask) return

      const all = tasks
        .filter(t => t.parent_task_id === null && t.status === overTask.status)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const overIndex = all.findIndex(t => t.id_task === overTaskId)
      if (overIndex === -1) return

      reorderMutation.mutate({ taskId, targetStatus: overTask.status, position: overIndex })
      return
    }

    const targetStatus = Number(over.id)
    if (!isNaN(targetStatus) && targetStatus >= 0 && targetStatus <= 4) {
      const end = tasks.filter(t =>
        t.parent_task_id === null && t.status === targetStatus).length
      reorderMutation.mutate({ taskId, targetStatus, position: end })
    }
  }, [reorderMutation, tasks])

  return (
    <div>
      <div className="flex items-start gap-3 mb-8">
        <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-foreground">Tablero de Tareas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona y organiza las tareas del proyecto</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 overflow-x-auto">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
          <div className="grid grid-cols-5 gap-6" style={{ minWidth: '1500px' }}>
            {STATUS_KEYS.map((statusKey, index) => (
              <TaskColumn key={statusKey} status={Number(statusKey)} tasks={groupedTasks[statusKey] ?? []} canEdit={canEdit} />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <Card className={`w-[300px] border-l-[3px] shadow-xl ${statusColors[STATUS_NAMES[activeTask.status]]?.overlayBorder ?? "border-l-muted-foreground"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-end mb-2">
                    <PriorityBadge priority={activeTask.priority} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{activeTask.task_name}</p>
                  {activeTask.task_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{activeTask.task_description}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
