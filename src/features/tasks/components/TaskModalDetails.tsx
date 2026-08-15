import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useModalParams } from "@/features/shared/hooks/useModalParams"
import { getTaskById, updateTask, updateTaskStatus } from "@/features/tasks/actions/task.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TASK_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { formatDate } from "@/features/shared/lib/format-date"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { Pencil, SquareStack } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { NotesPanel } from "@/features/notes/components/NotesPanel"
import { SubtaskChecklist } from "./SubtaskChecklist"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import TaskStatusPopover from "./TaskStatusPopover"
import DateRangePopover from "@/features/shared/components/DateRangePopover"
import { useUpdateTaskDates } from "../hooks/useUpdateTask"

export function TaskModalDetails() {
  const params = useParams()
  const queryClient = useQueryClient()

  const { show, paramValue: taskId, close } = useModalParams("viewTask")

  const { data, isError, error } = useQuery({
    queryKey: TASK_KEY(taskId!),
    queryFn: () => getTaskById(Number(taskId!)),
    enabled: !!taskId,
    retry: false,
  })

  const projectId = data?.project_id ?? Number(params.projectId ?? 0)

  const assignees = data?.assignments?.filter(a => a.name) ?? []
  const visibleAssignees = assignees.slice(0, 3)
  const extraCount = assignees.length - 3

  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState("")
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState("")

  const { mutate: mutateDesc } = useMutation({
    mutationFn: ({ task_id, task_description }: { task_id: number; task_description: string }) =>
      updateTask(task_id, { task_description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEY(taskId!) })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
    },
  })

  const { mutate: mutateTitle } = useMutation({
    mutationFn: ({ task_id, task_name, task_description }: { task_id: number; task_name: string; task_description: string }) =>
      updateTask(task_id, { task_name, task_description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEY(taskId!) })
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
    },
  })

  const { mutate: mutatePriority } = useMutation({
    mutationFn: ({ task_id, priority }: { task_id: number; priority: number | null }) =>
      updateTask(task_id, { priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEY(taskId!) })
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
    },
  })

  const { mutate: mutateDates, isPending: isPendingDates } = useUpdateTaskDates()

  const { mutate } = useMutation({
    mutationFn: async (status: number) => {
      return updateTaskStatus(Number(taskId!), { status })
    },
    onError: (error) => {
      toast.error(error.message ?? "Error")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: TASK_KEY(taskId!) })
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_KEY(projectId) })
    },
  })

  useEffect(() => {
    if (isError) {
      toast.error((error as Error)?.message ?? "Error")
    }
  }, [isError, error])

  if (isError) {
    return <Navigate to={`/dashboard`} />
  }

  if (data)
    return (
      <Sheet open={show} onOpenChange={() => close()}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-8 gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SquareStack className="h-3.5 w-3.5" />
            <span className="font-medium truncate">{data.task_name}</span>
            <span>·</span>
            <span>{TASK_STATUS_MAP[data.status]?.label ?? "Sin estado"}</span>
          </div>

          <div className="space-y-4">
            {editingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && titleValue.trim()) {
                    mutateTitle({ task_id: Number(taskId!), task_name: titleValue.trim(), task_description: data.task_description ?? "" })
                  }
                  if (e.key === "Enter" || e.key === "Escape") {
                    setEditingTitle(false)
                  }
                }}
                autoFocus
                className="w-full text-3xl font-bold text-foreground bg-transparent border-b border-brand-primary focus:outline-none"
              />
            ) : (
              <div className="group flex items-start gap-2">
                <SheetTitle className="text-3xl font-bold text-foreground flex-1">
                  {data.task_name}
                </SheetTitle>
                <button
                  onClick={() => { setTitleValue(data.task_name); setEditingTitle(true) }}
                  className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Renombrar tarea"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </label>
                <TaskStatusPopover
                  status={data.status ?? 0}
                  onSelect={(s) => mutate(s)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Prioridad
                </label>
                <PriorityPopover
                  priority={data.priority}
                  onSelect={(p) => mutatePriority({ task_id: Number(taskId!), priority: p })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Responsables
                </label>
                {assignees.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {visibleAssignees.map((a) => {
                      const initials = `${a.name?.[0] ?? ''}${a.apellido_paterno?.[0] ?? ''}`.toUpperCase() || '?'
                      return (
                        <Avatar key={a.user_id} size="sm" className="ring-2 ring-card">
                          <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
                        </Avatar>
                      )
                    })}
                    {extraCount > 0 && (
                      <span className="text-xs font-medium text-muted-foreground ml-1">+{extraCount}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Sin asignar</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cronograma
                </label>
                <DateRangePopover
                  startDate={data.start_date}
                  dueDate={data.due_date}
                  onSave={(start_date, due_date) =>
                    mutateDates(
                      { taskId: Number(taskId!), start_date, due_date },
                      { onError: () => toast.error("Error al actualizar las fechas") },
                    )
                  }
                  isPending={isPendingDates}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Descripción
            </label>
            {editingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  rows={3}
                  className="bg-transparent text-foreground text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (descValue.trim()) {
                        mutateDesc({ task_id: Number(taskId!), task_description: descValue.trim() })
                      }
                      setEditingDesc(false)
                    }
                    if (e.key === "Escape") {
                      setEditingDesc(false)
                    }
                  }}
                />
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => { setEditingDesc(false); setDescValue(data.task_description ?? "") }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <p className="text-sm text-foreground flex-1">
                  {data.task_description || <span className="italic text-muted-foreground">Agregar descripción</span>}
                </p>
                <button
                  onClick={() => { setDescValue(data.task_description ?? ""); setEditingDesc(true) }}
                  className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <SubtaskChecklist taskId={Number(taskId!)} />

          <NotesPanel notes={data.notes ?? []} taskId={Number(taskId)} />

          <div className="pt-2 text-xs text-muted-foreground border-t border-border/60 space-y-0.5">
            <p>Creada el {formatDate(data.created_at)}</p>
            <p>Actualizada el {formatDate(data.updated_at)}</p>
          </div>
        </SheetContent>
      </Sheet>
    )
}
