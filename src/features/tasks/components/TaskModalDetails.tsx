import { useEffect } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useModalParams } from "@/features/shared/hooks/useModalParams"
import { getTaskById, updateTaskStatus } from "@/features/tasks/actions/task.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TASK_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"
import { formatDate } from "@/features/shared/lib/format-date"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import { NotesPanel } from "./notes/NotesPanel"
import { SubtaskChecklist } from "./SubtaskChecklist"
import { Select } from "@/components/ui/select"

export function TaskModalDetails() {
  const params = useParams()
  const projectId = params.projectId!
  const queryClient = useQueryClient()

  const { show, paramValue: taskId, close } = useModalParams("viewTask")

  const { data, isError, error } = useQuery({
    queryKey: TASK_KEY(taskId!),
    queryFn: () => getTaskById(Number(taskId!)),
    enabled: !!taskId,
    retry: false,
  })

  const { mutate } = useMutation({
    mutationFn: async (status: number) => {
      return updateTaskStatus(Number(taskId!), { status })
    },
    onError: (error) => {
      toast.error(error.message ?? "Error")
    },
    onSuccess: () => {
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
      <Dialog open={show} onOpenChange={() => close()}>
        <DialogContent className="max-w-4xl h-[85vh] max-h-[85vh] flex flex-col p-8 gap-0">
          <div className="flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              Agregada el: {formatDate(data.created_at)}{" "}
            </p>
            <p className="text-sm text-muted-foreground">
              Última actualización: {formatDate(data.updated_at)}{" "}
            </p>
            <DialogTitle className="font-black text-4xl text-muted-foreground my-5">
              {data.task_name}
            </DialogTitle>
          </div>

          <div className="flex flex-1 min-h-0 gap-8 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-4 space-y-8">
              <p className="text-lg text-muted-foreground">
                {data.task_description}
              </p>

              <SubtaskChecklist
                projectId={Number(projectId)}
                taskId={Number(taskId!)}
              />
            </div>

            <div className="w-80 shrink-0 bg-muted/80 rounded-xl p-6 flex flex-col gap-y-8 border border-border overflow-y-auto">
              <div className="flex flex-col gap-y-3">
                <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Prioridad
                </label>
                <PriorityBadge priority={data.priority} />
              </div>

              <div className="flex flex-col gap-y-3">
                <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Cronograma
                </label>
                <div className="space-y-2 text-sm">
                  {data.start_date ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio:</span>
                      <span className="font-medium text-foreground">{formatDate(data.start_date)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio:</span>
                      <span className="text-muted-foreground italic">Sin definir</span>
                    </div>
                  )}
                  {data.due_date ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Límite:</span>
                      <span className="font-medium text-foreground">{formatDate(data.due_date)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Límite:</span>
                      <span className="text-muted-foreground italic">Sin definir</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-y-3">
                <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Estado actual
                </label>
                <Select value={String(data.status ?? 0)} onValueChange={(val) => mutate(Number(val))}>
                  <Select.Trigger className="w-full" id="status">
                    <Select.Value placeholder="Seleccionar estado">
                      {data.status !== null && data.status !== undefined
                        ? TASK_STATUS_MAP[data.status]?.label
                        : ""}
                    </Select.Value>
                  </Select.Trigger>
                  <Select.Popup>
                    <Select.List>
                      {Object.entries(TASK_STATUS_MAP).map(([key, info]) => (
                        <Select.Item key={key} value={key}>
                          {info.label}
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select>
              </div>

              <NotesPanel notes={data.notes ?? []} taskId={Number(taskId)} />
            </div>
          </div>

        </DialogContent>
      </Dialog>
    )
}
