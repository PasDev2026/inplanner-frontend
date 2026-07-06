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

  const isPending = checkUserPasswordMutation.isPending || deleteProjectMutation.isPending

  const handleForm = async (formData: CheckPasswordForm) =>{
    await checkUserPasswordMutation.mutateAsync(formData)

    await deleteProjectMutation.mutateAsync(Number(deleteProjectId!))
    
  }

  return (
    <Dialog open={show} onOpenChange={() => close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Proyecto</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Confirma la eliminación del proyecto{" "}
          <span className="font-semibold text-foreground">
            colocando tu password
          </span>
        </p>

        <form
          onSubmit={handleSubmit(handleForm)}
          noValidate
          className="space-y-4"
        >
          <InputForm
            label="Password"
            name="password"
            register={register}
            errors={errors}
            type="password"
            placeholder="Password Inicio de Sesión"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Eliminando..." : "Eliminar Proyecto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
