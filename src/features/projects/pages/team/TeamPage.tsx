import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AddMemberModal from "@/features/projects/components/team/AddMemberModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROJECT_TEAM_KEY } from "@/features/projects/lib/project-keys";
import { getResponsibles, removeResponsible } from "@/features/projects/actions/project.api";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ResponsibleMember = {
  project_id: number;
  user_id: number;
  user: {
    id_user: number;
    name: string;
    apellido_paterno: string | null;
    email: string;
  };
};

export default function TeamPage() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.projectId!;

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: PROJECT_TEAM_KEY(projectId),
    queryFn: () => getResponsibles(Number(projectId)),
    retry: false,
  });

  const { mutate } = useMutation({
    mutationFn: (userId: number) => removeResponsible(Number(projectId), userId),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success("Colaborador eliminado")
      queryClient.invalidateQueries({queryKey: PROJECT_TEAM_KEY(projectId)})
    },
  });

  if (isLoading) return "Cargando...";
  if (isError) return <Navigate to={"/404"} />;
  const members = (data as unknown as ResponsibleMember[]) ?? [];
  return (
    <>
      <h1 className="text-5xl font-semibold"> Administrar Equipo </h1>
      <p className="text-2xl font-semibold">
        Administra el equipo de trabajo para este projecto
      </p>

      <nav className="my-5 flex gap-3">
        <Button type="button" onClick={() => navigate("?addMember=true")}>
          Agregar Colaborador
        </Button>

        <Link
          className="bg-brand-primary hover:bg-brand-dark transition-colors text-white font-bold uppercase rounded-lg p-3 flex gap-3 items-center"
          to={`/projects/${projectId}/details-projects`}
        >
          Volver a Proyecto
        </Link>
      </nav>

      <h2 className="text-5xl font-black my-10">Miembros actuales</h2>
      {members.length ? (
        <ul
          role="list"
          className="divide-y divide-border border border-border mt-10 bg-card shadow-lg"
        >
          {members.map((member) => (
            <li
              key={member.user_id}
              className="flex justify-between gap-x-6 px-5 py-10"
            >
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto space-y-2">
                  <p className="text-2xl font-black text-foreground">
                    {member.user.name} {member.user.apellido_paterno ?? ''}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="-m-2.5 block p-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
                        <span className="sr-only">opciones</span>
                        <MoreVertical
                          className="h-9 w-9"
                          aria-hidden="true"
                        />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => mutate(member.user_id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Eliminar del Proyecto
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center py-20">No hay miembros en este equipo</p>
      )}

      <AddMemberModal />
    </>
  );
}
