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
import { updateProjectField } from "@/features/projects/actions/project.api"
import { BackendProject } from "@/features/shared/lib/types"
import { PROJECTS_KEY, PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys"

type EditProjectSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: BackendProject
}

export default function EditProjectSheet({ open, onOpenChange, project }: EditProjectSheetProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    defaultValues: {
      name_project: project.name_project,
      description_project: project.description_project ?? "",
      sede_id: project.sede_id ?? "",
      start_date: project.start_date ? project.start_date.split('T')[0] : null,
      due_date: project.due_date ? project.due_date.split('T')[0] : null,
      privacy_level: String(project.privacy_level ?? 0),
    },
    resolver: zodResolver(projectFormSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: ProjectFormValues) =>
      updateProjectField(project.id_project, {
        name_project: formData.name_project,
        description_project: formData.description_project,
        sede_id: formData.sede_id || undefined,
        start_date: formData.start_date,
        due_date: formData.due_date,
        privacy_level: Number(formData.privacy_level),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECT_DETAIL_KEY(project.id_project) })
      toast.success("Proyecto editado correctamente")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (formData: ProjectFormValues) => {
    if (formData.start_date && formData.due_date && formData.start_date > formData.due_date) {
      toast.error("La fecha límite debe ser posterior a la fecha de inicio")
      return
    }
    mutate(formData)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Editar proyecto</SheetTitle>
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
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
