import type { BackendTask } from "@/features/shared/lib/types"
import { memo, useRef, useState } from "react"
import { MoreVertical, CheckSquare, MessageSquare } from "lucide-react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"
import { deleteTask } from "@/features/tasks/actions/task.api"
import { toast } from "sonner"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import { statusColors } from "@/features/shared/constants/task-status.constant"
import { useUpdateTaskName } from "../hooks/useUpdateTask"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

const STATUS_NAMES = ["pending", "onHold", "inProgress", "underReview", "completed"] as const

type TaskCardProps = {
  task: BackendTask
  canEdit: boolean
  offsetY?: number
}

const TaskCard = memo(function TaskCard({ task, canEdit, offsetY }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id_task.toString()
  })

  const style = {
    transform: [CSS.Transform.toString(transform), offsetY ? `translateY(${offsetY}px)` : '']
      .filter(Boolean).join(' '),
    transition: [transition, 'transform 0.2s'].filter(Boolean).join(', '),
    opacity: isDragging ? 0.4 : 1,
  }

  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const projectId = params.projectId!
  const updateTaskNameHook = useUpdateTaskName()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queryClient = useQueryClient()

  const handleTaskNameClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      return
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      navigate(location.pathname + `?viewTask=${task.id_task}`)
    }, 250)
  }

  const handleTaskNameDoubleClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }
    setEditValue(task.task_name)
    setIsEditing(true)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editValue.trim()) {
      updateTaskNameHook.mutate({
        taskId: task.id_task,
        task_name: editValue.trim(),
        task_description: task.task_description ?? "",
      })
      setIsEditing(false)
      setEditValue("")
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue("")
    }
  }

  const { mutate } = useMutation({
    mutationFn: () => deleteTask(task.id_task),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success("Tarea eliminada correctamente")
      queryClient.invalidateQueries({ queryKey: PROJECT_DETAIL_KEY(projectId) })
      navigate(location.pathname, { replace: true })
    },
  })

  const assignees = task.assignments ?? []
  const visibleAssignees = assignees.slice(0, 2)
  const extraCount = assignees.length - 2
  const subtaskCount = task.subtasks_count ?? task.children?.length ?? 0
  const statusKey = STATUS_NAMES[task.status] ?? "pending"
  const borderColor = statusColors[statusKey]?.cardBorder ?? "border-l-muted-foreground"

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`group border-l-[3px] ${borderColor} relative`}>
        <CardContent className="p-3">
        <div
          {...listeners}
          {...attributes}
          className="min-w-0 pr-6"
        >
          <div className="flex items-center justify-end mb-1.5">
            <PriorityBadge priority={task.priority} />
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={() => {
                setIsEditing(false)
                setEditValue("")
              }}
              autoFocus
              className="flex-1 text-sm font-semibold text-foreground border border-brand-primary rounded px-1.5 py-0.5 focus:outline-none min-w-0"
            />
          ) : (
            <span
              onClick={handleTaskNameClick}
              onDoubleClick={handleTaskNameDoubleClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleTaskNameClick()
                }
              }}
              role="button"
              tabIndex={0}
              className="font-semibold text-sm text-foreground hover:text-muted-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none rounded"
            >
              {task.task_name}
            </span>
          )}

          {task.task_description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.task_description}</p>
          )}

          <hr className="border-t border-border/40 my-2" />

          <div className="flex items-center gap-2">
            {subtaskCount > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{subtaskCount}</span>
              </div>
            )}
            {task.notes && task.notes.length > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{task.notes.length}</span>
              </div>
            )}
            <div className="flex-1" />
            {assignees.length > 0 && (
              <div className="flex items-center -space-x-2">
                {visibleAssignees.map((a) => {
                  const initials = `${a.name?.[0] ?? ''}${a.apellido_paterno?.[0] ?? ''}`.toUpperCase() || (a.user_name?.[0]?.toUpperCase() ?? '?')
                  return (
                    <Avatar key={a.user_id} size="sm" className="ring-2 ring-card">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                  )
                })}
                {extraCount > 0 && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-medium ring-2 ring-card">
                    +{extraCount}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                  <span className="sr-only">opciones</span>
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(location.pathname + `?viewTask=${task.id_task}`)}>
                Ver Tarea
              </DropdownMenuItem>

              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => navigate(location.pathname + `?editTaskId=${task.id_task}`)}>
                    Editar Tarea
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => mutate()} className="text-destructive focus:text-destructive">
                    Eliminar Tarea
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    </div>
  )
})

export default TaskCard
