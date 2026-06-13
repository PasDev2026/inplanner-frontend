import { useForm } from "react-hook-form";
import Form, { ProjectFormValues } from "../components/ProjectForm";
import { createProject } from "@/features/shared/actions/project.api";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function ProjectCreatePage() {

  const navigate = useNavigate()
  const { data: user } = useAuth()

  const initialValues: ProjectFormValues = {
    name_project: "",
    description_project: "",
    sede_id: "",
    start_date: null,
    due_date: null,
  };

  const {register, handleSubmit, formState: { errors }, setValue, getValues, control} = useForm({ defaultValues: initialValues });

  const mutatiton = useMutation({
      mutationFn: createProject,
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: (_data) => {
        toast.success('Proyecto Creado :)');
        navigate('/dashboard')
      }
  })

  const handleForm = (formData: ProjectFormValues) => {
    mutatiton.mutateAsync({
      name_project: formData.name_project,
      description_project: formData.description_project,
      manager_id: user?.idUser ?? 0,
      sede_id: formData.sede_id ? Number(formData.sede_id) : undefined,
      start_date: formData.start_date,
      due_date: formData.due_date,
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold uppercase text-center mb-10">Crea tu proyecto</h1>

      <form 
        className="max-w-md mx-auto flex flex-col gap-6"
        onSubmit={handleSubmit(handleForm)}
        noValidate
      >
        
        <Form
          register={register}
          errors={errors}
          setValue={setValue}
          getValues={getValues}
          control={control}
        />

        <Button type="submit" className="w-full">
          Crear Proyecto
        </Button>
      </form>
    </div>
  );
}
