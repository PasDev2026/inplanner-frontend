import { Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { AuthUser } from "@/features/auth/actions/auth.api"
import type { BackendProject } from "@/features/shared/lib/types"
import ProjectBranchNode from "./ProjectBranchNode"
import BranchEmptyState from "./branch/BranchEmptyState"
import ProjectsBranchFilters from "./ProjectsBranchFilters"
import ProjectsBranchSort, { type DiagramSort } from "./ProjectsBranchSort"

type ProjectsBranchViewProps = {
  projects: BackendProject[]
  user: AuthUser
  sedes: CentralizadoItem[]
  statusSelected: string[]
  onStatusChange: (values: string[]) => void
  responsibleSelected: string[]
  onResponsibleChange: (ids: string[]) => void
  prioritySelected: number[]
  onPriorityChange: (values: number[]) => void
  sort: DiagramSort
  onSortChange: (sort: DiagramSort) => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export default function ProjectsBranchView({
  projects,
  user,
  sedes,
  statusSelected,
  onStatusChange,
  responsibleSelected,
  onResponsibleChange,
  prioritySelected,
  onPriorityChange,
  sort,
  onSortChange,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ProjectsBranchViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Network className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Roadmap de proyectos</h2>
            <p className="text-sm text-muted-foreground">
              Explora ramas, fases y avance general de cada proyecto
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProjectsBranchFilters
            statusSelected={statusSelected}
            onStatusChange={onStatusChange}
            responsibleSelected={responsibleSelected}
            onResponsibleChange={onResponsibleChange}
            prioritySelected={prioritySelected}
            onPriorityChange={onPriorityChange}
          />
          <ProjectsBranchSort sort={sort} onSortChange={onSortChange} />
        </div>
      </div>

      {projects.length === 0 ? (
        <BranchEmptyState label="No hay proyectos para mostrar" />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <ProjectBranchNode
              key={project.id_project}
              project={project}
              user={user}
              sedes={sedes}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Cargando..." : "Cargar más proyectos"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
