import { useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskColumn from "./TaskColumn"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTaskStatus } from "@/features/shared/actions/task.api"
import { toast } from "sonner"
import { useParams } from "react-router-dom"

type TaskListProps = {
  tasks: BackendTask[]
  canEdit: boolean
}

type GroupedTask = {
  [key: string]: BackendTask[]
}

const STATUS_KEYS = ["0", "1", "2", "3", "4"]

export default function TaskList({ tasks, canEdit }: TaskListProps) {
  const params = useParams()
  const projectId = Number(params.projectId!)
  const queryClient = useQueryClient()
  const [activeTask, setActiveTask] = useState<BackendTask | null>(null)

  const rootTasks = tasks.filter(task => !task.parent_task_id)
  const groupedTasks: GroupedTask = STATUS_KEYS.reduce((acc, key) => {
    acc[key] = rootTasks.filter(t => (t.status ?? 0) === Number(key))
    return acc
  }, {} as GroupedTask)

  const { mutate } = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: number }) => {
      const result = await updateTaskStatus(taskId, { status })
      if (!result) throw new Error("No data")
      return result
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editProject", projectId] })
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] })
    },
  })

  const handleDragStart = (e: DragStartEvent) => {
    const taskId = e.active.id.toString()
    const task = tasks.find(t => t.id_task.toString() === taskId)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const { over, active } = e

    if (over && over.id) {
      const taskId = Number(active.id.toString())
      const status = Number(over.id.toString())
      if (!isNaN(taskId) && !isNaN(status) && status >= 0 && status <= 4) {
        mutate({ taskId, status })
      }
    }
  }

  return (
    <div>
      <h2 className="text-5xl font-black my-10">Tareas</h2>

      <div className="flex gap-4 pb-32">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {STATUS_KEYS.map((statusKey) => (
            <TaskColumn key={statusKey} status={Number(statusKey)} tasks={groupedTasks[statusKey] ?? []} canEdit={canEdit} />
          ))}
          <DragOverlay>
            {activeTask ? (
              <div className="p-4 bg-white rounded-lg shadow-lg w-[300px] border-l-4 border-l-slate-500">
                <p className="font-bold text-foreground">{activeTask.task_name}</p>
                <p className="text-muted-foreground text-sm mt-1">{activeTask.task_description}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
