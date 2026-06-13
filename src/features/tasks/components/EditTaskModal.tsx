import { useNavigate, useParams, useLocation } from "react-router-dom"
import type { BackendTask, TaskFormData } from "@/features/shared/lib/types"
import { useForm } from "react-hook-form"
import TaskForm from "./TaskForm"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTask } from "@/features/shared/actions/task.api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type EditTaskModalProps = {
  data: BackendTask
  taskId: number
}

const PRIORITY_TO_FORM: Record<number, "low" | "medium" | "high"> = {
  1: "low",
  2: "medium",
  3: "high",
  4: "high",
}

const PRIORITY_TO_BACKEND: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export default function EditTaskModal({ data, taskId }: EditTaskModalProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const projectId = params.projectId!

  const toDateInputValue = (dateStr: string | undefined | null): string => {
    if (!dateStr) return ''
    return dateStr.slice(0, 10)
  }

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      name: data.task_name,
      description: data.task_description ?? "",
      priority: data.priority ? PRIORITY_TO_FORM[data.priority] ?? "medium" : "medium",
      startDate: toDateInputValue(data.start_date),
      dueDate: toDateInputValue(data.due_date),
    },
  })

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      return updateTask(taskId, {
        task_name: formData.name,
        task_description: formData.description,
        priority: formData.priority ? PRIORITY_TO_BACKEND[formData.priority] ?? 2 : null,
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editProject', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      toast.success("Tarea actualizada correctamente")
      reset()
      navigate(location.pathname, { replace: true })
    },
  })

  const handleEditTask = (formData: TaskFormData) => {
    mutate(formData)
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate(location.pathname, { replace: true })}>
      <DialogContent className="max-w-4xl p-16">
        <DialogHeader>
          <DialogTitle className="font-black text-4xl my-5">
            Editar Tarea
          </DialogTitle>
        </DialogHeader>

        <p className="text-xl font-bold">
          Realiza cambios a una tarea en {""}
          <span className="text-fuchsia-600">este formulario</span>
        </p>

        <form
          className="mt-10 space-y-3"
          onSubmit={handleSubmit(handleEditTask)}
          noValidate
        >
          <TaskForm errors={errors} register={register} setValue={setValue} getValues={getValues} showDates />

          <Button type="submit" className="w-full">
            Guardar Tarea
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
