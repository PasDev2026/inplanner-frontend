import { useDroppable } from "@dnd-kit/core"
import { TASK_STATUS_MAP } from "@/features/shared/i18n/es"
import type { BackendTask } from "@/features/shared/lib/types"
import TaskCard from "./TaskCard"

type TaskColumnProps = {
  status: number
  tasks: BackendTask[]
  canEdit: boolean
}

const COLUMN_STYLES: Record<number, { columnBg: string }> = {
  0: { columnBg: "bg-slate-50" },
  1: { columnBg: "bg-red-50" },
  2: { columnBg: "bg-blue-50" },
  3: { columnBg: "bg-amber-50" },
  4: { columnBg: "bg-emerald-50" },
}

const DOT_COLORS: Record<number, string> = {
  0: "bg-slate-500",
  1: "bg-red-500",
  2: "bg-blue-500",
  3: "bg-amber-500",
  4: "bg-emerald-500",
}

export default function TaskColumn({ status, tasks, canEdit }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status.toString() })
  const info = TASK_STATUS_MAP[status]
  const colors = COLUMN_STYLES[status] ?? { columnBg: "bg-slate-50" }
  const dotColor = DOT_COLORS[status] ?? "bg-slate-500"

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-lg transition-all ${colors.columnBg} ${isOver ? "ring-2 ring-blue-400/30" : ""}`}
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
}
