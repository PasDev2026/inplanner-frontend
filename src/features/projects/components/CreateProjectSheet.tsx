import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import ProjectForm from "./ProjectForm"
import { projectFormSchema } from "@/features/projects/schemas/project.schema"
import type { ProjectFormValues } from "@/features/projects/schemas/project.schema"
import { createProject } from "@/features/projects/actions/project.api"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PROJECTS_KEY } from "@/features/projects/lib/project-keys"

type CreateProjectSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyValues: ProjectFormValues = {
  name_project: "",
  description_project: "",
  sede_id: "",
  start_date: null,
  due_date: null,
}

export default function CreateProjectSheet({ open, onOpenChange }: CreateProjectSheetProps) {
  const queryClient = useQueryClient()
  const { data: user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    reset,
  } = useForm<ProjectFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(projectFormSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.success("Proyecto creado correctamente")
      reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (formData: ProjectFormValues) => {
    mutate({
      name_project: formData.name_project,
      description_project: formData.description_project,
      manager_id: user?.idUser ?? 0,
      sede_id: formData.sede_id ? Number(formData.sede_id) : undefined,
      start_date: formData.start_date,
      due_date: formData.due_date,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Crear proyecto</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4"
        >
          <ProjectForm
            register={register}
            errors={errors}
            setValue={setValue}
            getValues={getValues}
            control={control}
          />

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
