import { memo, useMemo } from "react"
import { useDroppable, useDndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PROJECT_STATUS_MAP, projectStatusColors, PROJECT_STATUS_NAMES } from "@/features/shared/constants/project-status.constant"
import type { BackendProject } from "@/features/shared/lib/types"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import ProjectKanbanCard from "./ProjectKanbanCard"

type ProjectKanbanColumnProps = {
  status: number
  projects: BackendProject[]
  sedes: CentralizadoItem[]
}

const STATUS_SET = new Set(["0", "1", "2", "3", "4"])

const ProjectKanbanColumn = memo(function ProjectKanbanColumn({ status, projects, sedes }: ProjectKanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status.toString() })
  const { active, collisions } = useDndContext()
  const isOver = active
    ? (collisions?.some(c => String(c.id) === status.toString()) ?? false)
    : false
  const info = PROJECT_STATUS_MAP[status]
  const colors = projectStatusColors[PROJECT_STATUS_NAMES[status]] ?? projectStatusColors.planning

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [projects],
  )
  const projectIds = useMemo(
    () => sortedProjects.map((p) => p.id_project.toString()),
    [sortedProjects],
  )

  const projectMap = useMemo(
    () => new Map(sortedProjects.map(p => [p.id_project.toString(), p])),
    [sortedProjects],
  )

  const overTarget = useMemo(() => {
    if (!active || !collisions?.length) return null

    const dragId = active.id.toString()
    const projectCollision = collisions.find(c => !STATUS_SET.has(String(c.id)))
    const colCollision = collisions.find(c => STATUS_SET.has(String(c.id)))

    if (projectCollision) {
      const overProjectId = Number(projectCollision.id)
      const overProject = sortedProjects.find(p => p.id_project === overProjectId)
      if (!overProject) return null
      if (overProject.status !== status) return null

      const siblings = sortedProjects.filter(p => p.id_project !== Number(dragId))
      const targetIdx = siblings.findIndex(p => p.id_project === overProjectId)
      if (targetIdx === -1) return null

      return { col: status, idx: targetIdx }
    }

    if (colCollision && String(colCollision.id) === status.toString()) {
      return { col: status, idx: sortedProjects.length }
    }

    return null
  }, [active, collisions, sortedProjects, status])

  const isDest = overTarget?.col === status
    && active != null
    && !projectMap.has(active.id.toString())

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl bg-card shadow-sm transition-all flex flex-col max-h-[calc(100vh-220px)] ${colors.columnBg} ${isOver ? "ring-2 ring-brand-primary/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {info?.label ?? "Desconocido"}
        </h3>
        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">{projects.length}</span>
      </div>

      <div className="space-y-2 p-2 overflow-y-auto flex-1 min-h-[120px]">
        <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
          {sortedProjects.map((project, index) => (
            <ProjectKanbanCard key={project.id_project} project={project} sedes={sedes}
              offsetY={isDest && index >= overTarget!.idx ? 88 : 0} />
          ))}
          {isDest && overTarget!.idx === sortedProjects.length && (
            <div style={{ height: 88 }} />
          )}
        </SortableContext>
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2.5">
            <div className={`w-12 h-12 rounded-full border-2 border-dashed ${colors.dotBorder} flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
            </div>
            <p className="text-sm font-semibold text-foreground">No hay proyectos</p>
            <p className="text-xs text-muted-foreground">Arrastra proyectos aquí</p>
          </div>
        )}
      </div>
    </div>
  )
})

export default ProjectKanbanColumn
