import { memo, useMemo } from "react"
import { useDroppable, useDndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TASK_STATUS_MAP, statusColors } from "@/features/shared/constants/task-status.constant"
import type { BackendTask } from "@/features/shared/lib/types"
import { Clock, Pause, Play, Eye, CheckCircle2 } from "lucide-react"
import TaskCard from "./TaskCard"

type TaskColumnProps = {
  status: number
  tasks: BackendTask[]
  canEdit: boolean
}

const STATUS_NAMES = ["pending", "onHold", "inProgress", "underReview", "completed"] as const
const STATUS_SET = new Set(["0", "1", "2", "3", "4"])

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  onHold: Pause,
  inProgress: Play,
  underReview: Eye,
  completed: CheckCircle2,
}

const iconColors: Record<string, string> = {
  pending: "text-muted-foreground",
  onHold: "text-warning",
  inProgress: "text-info",
  underReview: "text-warning",
  completed: "text-success",
}

const TaskColumn = memo(function TaskColumn({ status, tasks, canEdit }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id: status.toString() })
  const { active, collisions } = useDndContext()
  const isOver = active
    ? (collisions?.some(c => String(c.id) === status.toString()) ?? false)
    : false
  const statusKey = STATUS_NAMES[status]
  const Icon = statusIcons[statusKey]
  const info = TASK_STATUS_MAP[status]
  const colors = statusColors[statusKey] ?? statusColors.pending

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [tasks],
  )
  const taskIds = useMemo(
    () => sortedTasks.map((t) => t.id_task.toString()),
    [sortedTasks],
  )

  const taskMap = useMemo(
    () => new Map(sortedTasks.map(t => [t.id_task.toString(), t])),
    [sortedTasks]
  )

  const overTarget = useMemo(() => {
    if (!active || !collisions?.length) return null

    const dragId = active.id.toString()
    const taskCollision = collisions.find(c => !STATUS_SET.has(String(c.id)))
    const colCollision = collisions.find(c => STATUS_SET.has(String(c.id)))

    if (taskCollision) {
      const overTaskId = Number(taskCollision.id)
      const overTask = sortedTasks.find(t => t.id_task === overTaskId)
      if (!overTask) return null
      if (overTask.status !== status) return null

      const siblings = sortedTasks.filter(t => t.id_task !== Number(dragId))
      const targetIdx = siblings.findIndex(t => t.id_task === overTaskId)
      if (targetIdx === -1) return null

      return { col: status, idx: targetIdx }
    }

    if (colCollision && String(colCollision.id) === status.toString()) {
      return { col: status, idx: sortedTasks.length }
    }

    return null
  }, [active, collisions, sortedTasks, status])

  const isDest = overTarget?.col === status
    && active != null
    && !taskMap.has(active.id.toString())

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl bg-card shadow-sm transition-all flex flex-col max-h-[calc(100vh-220px)] ${colors.columnBg} ${isOver ? "ring-2 ring-brand-primary/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {info?.label ?? "Desconocido"}
        </h3>
        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>
      </div>

      <div className="space-y-2 p-2 overflow-y-auto flex-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task, idx) => (
            <TaskCard key={task.id_task} task={task} canEdit={canEdit} index={idx}
              offsetY={isDest && idx >= overTarget!.idx ? 88 : 0} />
          ))}
          {isDest && overTarget!.idx === sortedTasks.length && (
            <div style={{ height: 88 }} />
          )}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2.5">
            <div className={`w-12 h-12 rounded-full border-2 border-dashed ${colors.dotBorder} flex items-center justify-center`}>
              <Icon className={`size-5 ${iconColors[statusKey]}`} />
            </div>
            <p className="text-sm font-semibold text-foreground">No hay tareas</p>
            <p className="text-xs text-muted-foreground">Arrastra tareas aquí</p>
          </div>
        )}
      </div>
    </div>
  )
})

export default TaskColumn
