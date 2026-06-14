import type { BackendTask } from "@/features/shared/lib/types"
import { useRef, useState } from "react"
import { MoreVertical } from "lucide-react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTask } from "@/features/shared/actions/task.api"
import { toast } from "sonner"
import { useDraggable } from '@dnd-kit/core'
import PriorityBadge from "../../shared/components/PriorityBadge"
import { useUpdateTaskName } from "../hooks/useUpdateTask"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

type TaskCardProps = {
  task: BackendTask
  canEdit: boolean
}

export default function TaskCard({ task, canEdit }: TaskCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id_task.toString()
  })

  const navigate = useNavigate()
  const location = useLocation()
  const paramas = useParams()
  const projectId = paramas.projectId!
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
      queryClient.invalidateQueries({ queryKey: ["editProject", projectId] })
      navigate(location.pathname, { replace: true })
    },
  })

  return (
    <Card className={`group border-l-4`}
      style={{ borderLeftColor: task.status != null ? (task.status === 0 ? '#64748b' : task.status === 1 ? '#ef4444' : task.status === 2 ? '#3b82f6' : task.status === 3 ? '#f59e0b' : task.status === 4 ? '#10b981' : '#64748b') : '#64748b' }}
    >
      <CardContent className="p-5 flex justify-between">
      <div
        {...listeners}
        {...attributes}
        ref={setNodeRef}
        className="min-w-0 flex flex-col gap-y-4">
        <div className="flex items-center gap-2">
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
              className="flex-1 text-xl font-bold text-foreground border border-brand-primary rounded px-2 py-0.5 focus:outline-none min-w-0"
            />
          ) : (
            <span
              onClick={handleTaskNameClick}
              onDoubleClick={handleTaskNameDoubleClick}
              className="text-xl font-bold text-foreground hover:text-muted-foreground cursor-pointer"
            >
              {task.task_name}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
        <p className="text-muted-foreground text-sm">{task.task_description}</p>
      </div>
      <div className="flex shrink-0 gap-x-6">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="sr-only">opciones</span>
                <MoreVertical className="h-9 w-9" aria-hidden="true" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate(location.pathname + `?viewTask=${task.id_task}`)}>
              Ver Tarea
            </DropdownMenuItem>

            {canEdit && (
              <>
                <DropdownMenuItem onClick={() => navigate(location.pathname + `?editTaskId=${task.id_task}`)}>
                  Editar Tarea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => mutate()} className="text-red-500 focus:text-red-500">
                  Eliminar Tarea
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
    </Card>
  )
}
