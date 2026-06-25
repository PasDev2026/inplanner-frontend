import { memo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskCard from "./TaskCard"

type TaskColumnProps = {
  status: number
  tasks: BackendTask[]
  canEdit: boolean
}

const COLUMN_STYLES: Record<number, { columnBg: string }> = {
  0: { columnBg: "bg-muted" },
  1: { columnBg: "bg-warning/10" },
  2: { columnBg: "bg-info/10" },
  3: { columnBg: "bg-warning/10" },
  4: { columnBg: "bg-success/10" },
}

const DOT_COLORS: Record<number, string> = {
  0: "bg-muted-foreground",
  1: "bg-warning",
  2: "bg-info",
  3: "bg-warning",
  4: "bg-success",
}

const TaskColumn = memo(function TaskColumn({ status, tasks, canEdit }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status.toString() })
  const info = TASK_STATUS_MAP[status]
  const colors = COLUMN_STYLES[status] ?? { columnBg: "bg-muted" }
  const dotColor = DOT_COLORS[status] ?? "bg-muted-foreground"

  return (
    <div
      ref={setNodeRef}
       className={`flex-1 rounded-lg transition-all ${colors.columnBg} ${isOver ? "ring-2 ring-brand-primary/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">
          {info?.label ?? "Desconocido"}
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      <div className="space-y-3 px-1 pb-3">
        {tasks.map((task) => (
          <TaskCard key={task.id_task} task={task} canEdit={canEdit} />
        ))}
      </div>
    </div>
  )
})

export default TaskColumn
