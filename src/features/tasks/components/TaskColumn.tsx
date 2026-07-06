import { memo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { TASK_STATUS_MAP, statusColors } from "@/features/shared/constants/task-status.constant"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskCard from "./TaskCard"

type TaskColumnProps = {
  status: number
  tasks: BackendTask[]
  canEdit: boolean
}

const STATUS_NAMES = ["pending", "onHold", "inProgress", "underReview", "completed"] as const

const TaskColumn = memo(function TaskColumn({ status, tasks, canEdit }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status.toString() })
  const info = TASK_STATUS_MAP[status]
  const colors = statusColors[STATUS_NAMES[status]] ?? statusColors.pending

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl bg-card shadow-sm transition-all ${colors.columnBg} ${isOver ? "ring-2 ring-brand-primary/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {info?.label ?? "Desconocido"}
        </h3>
        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>
      </div>

      <div className="space-y-2 p-2">
        {tasks.map((task) => (
          <TaskCard key={task.id_task} task={task} canEdit={canEdit} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 italic">Arrastra tareas aquí</p>
        )}
      </div>
    </div>
  )
})

export default TaskColumn
