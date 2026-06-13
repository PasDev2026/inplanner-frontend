import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { TaskFormData } from "@/features/shared/lib/types"
import TaskForm from "./TaskForm"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask } from "@/features/shared/actions/task.api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CreateTaskModal() {
  const navigate = useNavigate()

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const modalTask = queryParams.get("newTask")
  const show = modalTask ? true : false

  const params = useParams()
  const projectId = Number(params.projectId!)

  const initialValues: TaskFormData = {
    name: "",
    description: "",
    priority: "medium",
  }

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({ defaultValues: initialValues })

  const queryCliente = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      return createTask({
        task_name: formData.name,
        project_id: Number(projectId),
      })
    },
    onError: (error) => {
      toast.error(error.message ?? "Error")
    },
    onSuccess: () => {
      queryCliente.invalidateQueries({ queryKey: ['editProject', projectId] })
      queryCliente.invalidateQueries({ queryKey: ['projectTasks', projectId] })
      toast.success('Tarea creada')
      reset()
      navigate(location.pathname, { replace: true })
    },
  })

  const handleCreateTask = (formData: TaskFormData) => {
    mutate(formData)
  }

  return (
    <Dialog open={show} onOpenChange={() => navigate(location.pathname, { replace: true })}>
      <DialogContent className="max-w-4xl p-16">
        <DialogHeader>
          <DialogTitle className="font-black text-4xl my-5">
            Nueva Tarea
          </DialogTitle>
        </DialogHeader>

        <p className="text-xl font-bold">
          Llena el formulario y crea {""}
          <span className="text-fuchsia-600">una tarea</span>
        </p>

        <form className="flex flex-col gap-5 mt-10" noValidate
          onSubmit={handleSubmit(handleCreateTask)}
        >
          <TaskForm register={register} errors={errors} />

          <Button type="submit" className="w-full">
            Guardar Tarea
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
