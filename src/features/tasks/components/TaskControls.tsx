import { useState } from "react"
import { LayoutTemplate, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { BackendTask } from "@/features/shared/lib/types"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import SaveAsTemplateDialog from "@/features/templates/components/SaveAsTemplateDialog"
import { useTaskMutations } from "../hooks/useTaskMutations"
import TaskStatusPopover from "./TaskStatusPopover"
import TaskDateCellPopover from "./TaskDateCellPopover"

type TaskControlsProps = {
  task: BackendTask
  projectId: number
  projectStartDate?: string | null
  projectDueDate?: string | null
}

export default function TaskControls({
  task,
  projectId,
  projectStartDate,
  projectDueDate,
}: TaskControlsProps) {
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const { statusMutation, priorityMutation, assignmentMutation, deleteTaskMutation } =
    useTaskMutations(projectId)

  const handleDelete = () => {
    toast("¿Eliminar tarea?", {
      description: "Esta acción eliminará la tarea y todas sus subtareas",
      action: {
        label: "Eliminar",
        onClick: () => deleteTaskMutation.mutate(task.id_task),
      },
    })
  }

  const currentIds = task.assignments?.map((assignment) => assignment.user_id) ?? []

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TaskStatusPopover
        status={task.status}
        onSelect={(status) => statusMutation.mutate({ taskId: task.id_task, status })}
        isPending={statusMutation.isPending}
      />

      <ResponsiblePopover
        projectId={projectId}
        assignedTo={task.assignments?.map((assignment) => ({ user_id: assignment.user_id })) ?? []}
        onAssign={(userIds) =>
          assignmentMutation.mutate({ taskId: task.id_task, userIds, currentIds })
        }
        isPending={assignmentMutation.isPending}
      />

      <PriorityPopover
        priority={task.priority}
        onSelect={(priority) => priorityMutation.mutate({ taskId: task.id_task, priority })}
        isPending={priorityMutation.isPending}
      />

      <TaskDateCellPopover
        projectId={String(projectId)}
        taskId={task.id_task}
        startDate={task.start_date}
        dueDate={task.due_date}
        projectStartDate={projectStartDate}
        projectDueDate={projectDueDate}
      />

      <button
        type="button"
        onClick={() => setSaveTemplateOpen(true)}
        title="Guardar como plantilla"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleDelete}
        title="Eliminar tarea"
        className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive/80"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {saveTemplateOpen && (
        <SaveAsTemplateDialog
          open
          onOpenChange={setSaveTemplateOpen}
          taskId={task.id_task}
        />
      )}
    </div>
  )
}
