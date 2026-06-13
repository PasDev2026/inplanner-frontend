import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAdmin } from "@/features/admin/schemas/user.schema";
import { createResponsible } from "@/features/shared/actions/project.api";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export type SearchResultProps = {
  user: UserAdmin
  reset: () => void
  resetMutation: () => void
};

export default function SearchResult({ user, reset, resetMutation }: SearchResultProps) {
    const navigate = useNavigate()

    const params = useParams()
    const projectId = params.projectId!

    const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => createResponsible(Number(projectId), user.id_user),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success("Usuario agregado al proyecto correctamente")
      reset()
      resetMutation()
      navigate(location.pathname, {replace:true})

      queryClient.invalidateQueries({queryKey: ['projectTeam', projectId]})
    },
  })

  return (
    <>
      <p className="mt-10 text-center font-bold"> Resultado: </p>
      <div className="flex justify-between items-center gap-4 mt-2">
        <p className="font-bold">Nombre: {user.name} {user.apellido_paterno ?? ''}</p>
        <Button
          variant="destructive"
          onClick={() => mutate()}
        >
          Agregar al proyecto
        </Button>
      </div>
    </>
  );
}
