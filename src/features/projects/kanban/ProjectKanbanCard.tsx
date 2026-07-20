import type { BackendProject } from "@/features/shared/lib/types"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import { memo } from "react"
import { MoreVertical, Trash2, Building2, ArrowDown, ArrowRight, ArrowUp, ChevronsUp, Calendar } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECTS_KEY, PROJECTS_KANBAN_KEY } from "@/features/projects/lib/project-keys"
import { deleteProject } from "@/features/projects/actions/project.api"
import { toast } from "sonner"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { projectStatusColors, PROJECT_STATUS_NAMES } from "@/features/shared/constants/project-status.constant"
import { PRIORITY_MAP } from "@/features/shared/constants/priority.constant"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import CircularProgress from "@/components/ui/CircularProgress"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { formatDateRange } from "@/features/shared/lib/format-date"

type ProjectKanbanCardProps = {
  project: BackendProject
  offsetY?: number
  sedes: CentralizadoItem[]
}

const priorityColors: Record<number, string> = {
  1: "text-success",
  2: "text-warning",
  3: "text-destructive",
  4: "text-destructive",
}

function PriorityIcon({ priority }: { priority: number }) {
  if (priority === 1) return <ArrowDown className="size-3.5 text-success" />
  if (priority === 2) return <ArrowRight className="size-3.5 text-warning" />
  if (priority === 3) return <ArrowUp className="size-3.5 text-destructive" />
  if (priority === 4) return <ChevronsUp className="size-3.5 text-destructive" />
  return null
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
  const sedeName = project.sede_id != null ? sedes.find(s => s.id === project.sede_id)?.nombre : undefined
  const priorityInfo = PRIORITY_MAP[project.priority]
  const dateRange = formatDateRange(project.start_date, project.due_date)

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`group border-l-[3px] ${colors.cardBorder} relative`}>
        <CardContent className="p-3">
          <div {...listeners} {...attributes} className="min-w-0">
            {/* Top row: Title + Progress + Menu */}
            <div className="flex justify-between items-start gap-2">
              <p className="font-semibold text-sm text-foreground break-words min-w-0 flex-1">
                {project.name_project}
              </p>
              <div className="flex items-start gap-1 shrink-0 pt-0.5">
                <CircularProgress percentage={project.progress} size="sm" />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-2.5 space-y-1.5">
              {/* Responsable */}
              {responsibles.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex -space-x-1.5">
                    {visible.map((r) => {
                      const initials = `${r.name?.[0] ?? ""}${r.apellido_paterno?.[0] ?? ""}`.toUpperCase() || "?"
                      return (
                        <Avatar key={r.user_id} size="sm" className="ring-2 ring-card size-5">
                          <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                        </Avatar>
                      )
                    })}
                    {extraCount > 0 && (
                      <div className="flex items-center justify-center size-5 rounded-full bg-muted text-muted-foreground text-[9px] font-medium ring-2 ring-card">
                        +{extraCount}
                      </div>
                    )}
                  </div>
                  <span className="truncate">
                    {visible.map(r => `${r.name} ${r.apellido_paterno ?? ""}`.trim()).join(", ")}
                    {extraCount > 0 && ` +${extraCount}`}
                  </span>
                </div>
              )}

              {/* Sede */}
              {sedeName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  <span className="truncate">{sedeName}</span>
                </div>
              )}

              {/* Prioridad */}
              {priorityInfo && (
                <div className="flex items-center gap-1.5 text-xs">
                  <PriorityIcon priority={project.priority} />
                  <span className={`${priorityColors[project.priority]} font-medium`}>
                    {priorityInfo.label}
                  </span>
                </div>
              )}

              {/* Fechas */}
              {dateRange && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" />
                  <span className="truncate">{dateRange}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default ProjectKanbanCard
