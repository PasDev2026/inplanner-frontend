import { useLocation, useNavigate } from "react-router-dom"
import { MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import isManager from "@/features/shared/lib/policies"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { BackendProject } from "@/features/shared/lib/types"
import StatusPopover from "@/features/projects/components/StatusPopover"
import DateCellPopover from "@/features/projects/components/DateCellPopover"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject"
import { useUpdateProjectResponsible } from "@/features/projects/hooks/useUpdateProjectResponsible"

type ProjectControlsProps = {
  project: BackendProject
  user: { id: string }
  sedes: CentralizadoItem[]
  onEdit: () => void
}

export default function ProjectControls({
  project,
  user,
  sedes,
  onEdit,
}: ProjectControlsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const updateProject = useUpdateProject()
  const updateResponsible = useUpdateProjectResponsible()

  const sedeName =
    project.sede_id != null
      ? sedes.find((sede) => sede.id === project.sede_id)?.nombre ?? ""
      : ""
  const isManagerUser = isManager(project.manager_id, user.id)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sedeName && <Badge variant="slate">{sedeName}</Badge>}
      <Badge variant={isManagerUser ? "brand-light" : "brand"}>
        {isManagerUser ? "Manager" : "Colaborador"}
      </Badge>

      <StatusPopover
        status={project.status}
        onSelect={(status) => updateProject.mutate({ projectId: project.id_project, status })}
        isPending={updateProject.isPending}
      />

      <ResponsiblePopover
        projectId={project.id_project}
        assignedTo={project.responsibles ?? []}
        onAssign={(userIds) =>
          updateResponsible.mutate({ projectId: project.id_project, userIds })
        }
        isPending={updateResponsible.isPending}
      />

      <PriorityPopover
        priority={project.priority}
        onSelect={(priority) =>
          priority != null && updateProject.mutate({ projectId: project.id_project, priority })
        }
      />

      <DateCellPopover
        projectId={project.id_project}
        startDate={project.start_date}
        dueDate={project.due_date}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <span className="sr-only">opciones</span>
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => navigate(`/projects/${project.id_project}/details-projects`)}
          >
            Ver Proyecto
          </DropdownMenuItem>
          {isManagerUser && (
            <>
              <DropdownMenuItem onClick={onEdit}>Editar Proyecto</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(location.pathname + `?deleteProject=${project.id_project}`)
                }
                className="text-destructive focus:text-destructive"
              >
                Eliminar Proyecto
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
