import { useState, useMemo, useCallback } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin, MeasuringStrategy } from "@dnd-kit/core"
import type { BackendProject } from "@/features/shared/lib/types"
import ProjectKanbanColumn from "./ProjectKanbanColumn"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PROJECTS_KEY, PROJECTS_KANBAN_KEY } from "@/features/projects/lib/project-keys"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"
import { getKanbanProjects, reorderProject } from "@/features/projects/actions/project.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { toast } from "sonner"
import { LayoutGrid } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import PriorityBadge from "@/features/shared/components/PriorityBadge"
import { projectStatusColors, PROJECT_STATUS_NAMES } from "@/features/shared/constants/project-status.constant"

type GroupedProjects = {
  [key: string]: BackendProject[]
}

const STATUS_KEYS = ["0", "1", "2", "3", "4"]

export default function ProjectKanbanBoard() {
  const queryClient = useQueryClient()
  const [activeProject, setActiveProject] = useState<BackendProject | null>(null)

  const { data: projects = [] } = useQuery({
    queryKey: PROJECTS_KANBAN_KEY,
    queryFn: getKanbanProjects,
    staleTime: 30_000,
  })

  const { data: sedes = [] } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    staleTime: 5 * 60_000,
  })

  const groupedProjects: GroupedProjects = useMemo(() => {
    return STATUS_KEYS.reduce((acc, key) => {
      acc[key] = projects.filter(p => (p.status ?? 0) === Number(key))
      return acc
    }, {} as GroupedProjects)
  }, [projects])

  const reorderMutation = useMutation({
    mutationFn: async ({ projectId, targetStatus, position }: { projectId: number; targetStatus: number; position: number }) => {
      const result = await reorderProject({ projectId, targetStatus, position })
      if (!result) throw new Error("No data")
      return result
    },
    onError: (error) => toast.error((error as Error).message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KANBAN_KEY })
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const projectId = e.active.id.toString()
    const project = projects.find(p => p.id_project.toString() === projectId)
    if (project) setActiveProject(project)
  }, [projects])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveProject(null)
    const { over, active, collisions } = e
    if (!over?.id) return

    const projectId = Number(active.id.toString())

    const projectCollision = collisions?.find(c =>
      !['0','1','2','3','4'].includes(String(c.id)))
    if (projectCollision) {
      const overProjectId = Number(projectCollision.id)
      const activeProject = projects.find(p => p.id_project === projectId)
      const overProject = projects.find(p => p.id_project === overProjectId)
      if (!activeProject || !overProject) return

      const all = projects
        .filter(p => p.status === overProject.status)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const overIndex = all.findIndex(p => p.id_project === overProjectId)
      if (overIndex === -1) return

      reorderMutation.mutate({ projectId, targetStatus: overProject.status, position: overIndex })
      return
    }

    const targetStatus = Number(over.id)
    if (!isNaN(targetStatus) && targetStatus >= 0 && targetStatus <= 4) {
      const end = projects.filter(p => p.status === targetStatus).length
      reorderMutation.mutate({ projectId, targetStatus, position: end })
    }
  }, [reorderMutation, projects])

  return (
    <div>
      <div className="flex items-start gap-3 mb-8">
        <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-foreground">Tablero de Proyectos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona y organiza los proyectos por estado</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 overflow-x-auto">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={pointerWithin}
          measuring={{
            droppable: { strategy: MeasuringStrategy.WhileDragging },
          }}>
          <div className="grid grid-cols-5 gap-6" style={{ minWidth: '1500px' }}>
            {STATUS_KEYS.map((statusKey) => (
              <ProjectKanbanColumn key={statusKey} status={Number(statusKey)} projects={groupedProjects[statusKey] ?? []} sedes={sedes} />
            ))}
          </div>
          <DragOverlay>
            {activeProject ? (
              <Card className={`w-[300px] border-l-[3px] shadow-xl ${projectStatusColors[PROJECT_STATUS_NAMES[activeProject.status]]?.overlayBorder ?? "border-l-muted-foreground"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-end mb-2">
                    <PriorityBadge priority={activeProject.priority} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{activeProject.name_project}</p>
                  {activeProject.description_project && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{activeProject.description_project}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
