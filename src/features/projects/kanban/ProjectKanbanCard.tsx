import type { BackendProject } from "@/features/shared/lib/types"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import { memo } from "react"
import { MoreVertical, Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECTS_KEY, PROJECTS_KANBAN_KEY } from "@/features/projects/lib/project-keys"
import { deleteProject } from "@/features/projects/actions/project.api"
import { toast } from "sonner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import { projectStatusColors, PROJECT_STATUS_NAMES } from "@/features/shared/constants/project-status.constant"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/features/shared/lib/format-date"

type ProjectKanbanCardProps = {
  project: BackendProject
  offsetY?: number
  sedes: CentralizadoItem[]
}

const ProjectKanbanCard = memo(function ProjectKanbanCard({ project, offsetY, sedes }: ProjectKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id_project.toString(),
  })

  const style = {
    transform: [CSS.Transform.toString(transform), offsetY ? `translateY(${offsetY}px)` : ""]
      .filter(Boolean).join(" "),
    transition: [transition, "transform 0.2s"].filter(Boolean).join(", "),
    opacity: isDragging ? 0.4 : 1,
  }

  const queryClient = useQueryClient()

  const { mutate: removeProject } = useMutation({
    mutationFn: () => deleteProject(project.id_project),
    onError: (error) => toast.error((error as Error).message),
    onSuccess: () => {
      toast.success("Proyecto eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: PROJECTS_KANBAN_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  const statusKey = PROJECT_STATUS_NAMES[project.status] ?? "planning"
  const colors = projectStatusColors[statusKey] ?? projectStatusColors.planning
  const responsibles = project.responsibles ?? []
  const visible = responsibles.slice(0, 2)
  const extraCount = responsibles.length - 2
  const sedeName = project.sede_id != null ? sedes.find(s => s.id === Number(project.sede_id))?.nombre : undefined

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`group border-l-[3px] ${colors.cardBorder} relative`}>
        <CardContent className="p-3">
          <div {...listeners} {...attributes} className="min-w-0 pr-6">
            <div className={`flex items-center mb-1.5 ${sedeName ? 'justify-between' : 'justify-end'}`}>
              {sedeName && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px]">
                  {sedeName}
                </span>
              )}
              <PriorityBadge priority={project.priority} />
            </div>

            <p className="font-semibold text-sm text-foreground">
              {project.name_project}
            </p>

            {project.description_project && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {project.description_project}
              </p>
            )}

            <hr className="border-t border-border/40 my-2" />

            <div className="flex items-center gap-2">
              {project.due_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(project.due_date)}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-medium ml-auto">
                {project.progress.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center -space-x-2">
                {visible.map((r) => {
                  const initials = `${r.name?.[0] ?? ""}${r.apellido_paterno?.[0] ?? ""}`.toUpperCase() || "?"
                  return (
                    <Avatar key={r.user_id} size="sm" className="ring-2 ring-card">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                  )
                })}
                {extraCount > 0 && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-medium ring-2 ring-card">
                    +{extraCount}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                    <span className="sr-only">opciones</span>
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => removeProject()} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar proyecto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default ProjectKanbanCard
