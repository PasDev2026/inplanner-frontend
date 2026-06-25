import { useModalParams } from "@/features/shared/hooks/useModalParams";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import type { CheckPasswordForm } from "@/features/auth/schemas/reset-password.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROJECTS_KEY } from "@/features/projects/lib/project-keys";
import { checkPasswordApi } from "@/features/auth/actions/auth.api";
import { toast } from "sonner";
import { deleteProject } from "@/features/projects/actions/project.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/features/shared/components/form/InputForm";

export default function DeleteProjectModal() {
  const initialValues: CheckPasswordForm = {
    password: "",
  };
  const { show, paramValue: deleteProjectId, close } = useModalParams("deleteProject");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckPasswordForm>({ defaultValues: initialValues, resolver: zodResolver(checkPasswordSchema) });

  const checkUserPasswordMutation = useMutation({
    mutationFn: checkPasswordApi,
    onError: (error) => {
      toast.error(error.message)
    }
  })
  const queryClient = useQueryClient();


  const deleteProjectMutation = useMutation({
      mutationFn: deleteProject,
      onError: (error) => {
        toast.error(error.message)
      },
      onSuccess: () => {
        toast.success("Proyecto eliminado")
        queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
        close();
      },
    });

  const handleForm = async (formData: CheckPasswordForm) =>{
    await checkUserPasswordMutation.mutateAsync(formData)

    await deleteProjectMutation.mutateAsync(Number(deleteProjectId!))
    
  }

  return (
    <Dialog open={show} onOpenChange={() => close()}>
      <DialogContent className="max-w-4xl p-16">
        <DialogHeader>
          <DialogTitle className="font-black text-4xl my-5">
            Eliminar Proyecto
          </DialogTitle>
        </DialogHeader>

        <p className="text-xl font-bold">
          Confirma la eliminación del proyecto {""}
          <span className="text-fuchsia-600">
            colocando tu password
          </span>
        </p>

        <form
          className="mt-10 space-y-5"
          onSubmit={handleSubmit(handleForm)}
          noValidate
        >
          <InputForm
            label="Password"
            name="password"
            register={register}
            errors={errors}
            type="password"
            placeholder="Password Inicio de Sesión"
            labelClassName="font-normal text-2xl"
          />

          <Button type="submit" className="w-full" variant="destructive">
            Eliminar Proyecto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
