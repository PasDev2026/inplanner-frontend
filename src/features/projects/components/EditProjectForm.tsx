import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROJECTS_KEY, PROJECT_DETAIL_KEY } from "@/features/projects/lib/project-keys";
import ProjectForm from "./ProjectForm";
import { BackendProject } from "@/features/shared/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { projectFormSchema } from "@/features/projects/schemas/project.schema";
import { updateProjectField } from "@/features/projects/actions/project.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { ProjectFormValues } from "./ProjectForm";
import { Button } from "@/components/ui/button";

type EditPrjectFormData = {
  data: BackendProject;
  projectId: number;
};

export default function EditProjectForm({
  data,
  projectId,
}: EditPrjectFormData) {
    const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name_project: data.name_project,
      description_project: data.description_project ?? "",
      sede_id: data.sede_id != null ? String(data.sede_id) : "",
      start_date: data.start_date ? data.start_date.split('T')[0] : null,
      due_date: data.due_date ? data.due_date.split('T')[0] : null,
    }
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (formData: ProjectFormValues) =>
      updateProjectField(projectId, {
        name_project: formData.name_project,
        description_project: formData.description_project,
        sede_id: formData.sede_id ? Number(formData.sede_id) : undefined,
        start_date: formData.start_date,
        due_date: formData.due_date,
      }),
    onError: (error) => {
      toast.error((error as Error).message)
    },
    onSuccess: () => {
      toast.success("Proyecto editado correctamente")
      queryClient.invalidateQueries({queryKey: PROJECTS_KEY})
      queryClient.invalidateQueries({queryKey: PROJECT_DETAIL_KEY(projectId)})
      navigate("/dashboard");
    },
  });

  const handleForm = (formData: ProjectFormValues) => {
    mutate(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold uppercase text-center mb-10">
        Edita tu proyecto
      </h1>

      <form
        className="max-w-md mx-auto flex flex-col gap-6"
        onSubmit={handleSubmit(handleForm)}
        noValidate
      >
        <ProjectForm register={register} errors={errors} setValue={undefined} getValues={getValues} hideEmpresa />

        <Button type="submit" className="w-full">
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
