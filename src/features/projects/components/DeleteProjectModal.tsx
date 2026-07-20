import { useModalParams } from "@/features/shared/hooks/useModalParams";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PROJECTS_KEY } from "@/features/projects/lib/project-keys";
import { toast } from "sonner";
import { deleteProject } from "@/features/projects/actions/project.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteProjectModal() {
  const { show, paramValue: deleteProjectId, close } = useModalParams("deleteProject");

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteProject(deleteProjectId!),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success("Proyecto eliminado")
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      close();
    },
  })

  return (
    <Dialog open={show} onOpenChange={() => close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Proyecto</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          ¿Estás seguro de eliminar este proyecto?
        </p>

        <div className="flex gap-3 pt-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Eliminando..." : "Eliminar Proyecto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
