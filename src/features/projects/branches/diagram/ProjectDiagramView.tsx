import { useCallback, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { TaskModalDetails } from "@/features/tasks/components/TaskModalDetails"
import PageSpinner from "@/components/ui/PageSpinner"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations"
import { buildBranchTree, flattenBranchTasks } from "@/features/projects/lib/project-branch"
import type { BackendProject } from "@/features/shared/lib/types"
import ProjectBranchNode from "../ProjectBranchNode"
import { useIsCompact } from "../hooks/useIsCompact"
import { useProjectBranches } from "../hooks/useProjectBranches"
import DiagramCanvas from "./canvas/DiagramCanvas"
import DiagramEmptyState from "./canvas/DiagramEmptyState"
import { useDiagramColorMode } from "./hooks/useDiagramColorMode"
import { useDiagramExpansion } from "./hooks/useDiagramExpansion"
import { useDiagramGraph } from "./hooks/useDiagramGraph"
import { useDiagramNodes } from "./hooks/useDiagramNodes"
import { useDiagramPositions } from "./hooks/useDiagramPositions"
import { useDiagramViewMode } from "./hooks/useDiagramViewMode"

export default function ProjectDiagramView({
  project,
}: {
  project: BackendProject
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const isCompact = useIsCompact()

  const { data: user, isLoading: authLoading } = useAuth()
  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
    staleTime: 5 * 60_000,
  })

  const { data: tasks, isLoading } = useProjectBranches(
    project.id_project,
    !isCompact,
  )
  const roots = useMemo(() => buildBranchTree(tasks ?? []), [tasks])
  const flatTasks = useMemo(() => flattenBranchTasks(roots), [roots])

  const { expanded, toggle } = useDiagramExpansion(project.id_project, roots)
  const colorMode = useDiagramColorMode()
  const { mode, setMode } = useDiagramViewMode(project.id_project)
  const { positions, setPosition, reset: resetLayout } = useDiagramPositions(
    project.id_project,
  )
  const { reorderMutation } = useTaskMutations(project.id_project)

  const onSelectTask = useCallback(
    (taskId: number) => {
      navigate(location.pathname + `?viewTask=${taskId}`)
    },
    [navigate, location.pathname],
  )

  const onReorder = useCallback(
    (taskId: number, parentId: number | null, index: number) => {
      reorderMutation.mutate({
        taskId,
        parentTaskId: parentId,
        position: index,
      })
    },
    [reorderMutation],
  )

  const { nodes: graphNodes, edges: graphEdges } = useDiagramGraph({
    project,
    roots,
    expanded,
    onToggle: toggle,
    onSelectTask,
  })

  const { nodes, edges, onNodesChange, onNodeDragStop } = useDiagramNodes({
    graphNodes,
    edges: graphEdges,
    mode,
    positions,
    tasks: flatTasks,
    rootsCount: roots.length,
    projectId: project.id_project,
    onReorder,
    onPositionChange: setPosition,
  })

  if (isCompact) {
    if (authLoading || !user) {
      return (
        <div className="flex h-[70vh] items-center justify-center">
          <PageSpinner fullPage={false} />
        </div>
      )
    }
    return (
      <>
        <ProjectBranchNode
          project={project}
          user={user}
          sedes={sedes ?? []}
          defaultExpanded
        />
        <TaskModalDetails />
      </>
    )
  }

  return (
    <>
      {isLoading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <PageSpinner fullPage={false} />
        </div>
      ) : roots.length === 0 ? (
        <DiagramEmptyState label="Este proyecto aún no tiene tareas" />
      ) : (
        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          colorMode={colorMode}
          mode={mode}
          onModeChange={setMode}
          onResetLayout={resetLayout}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
        />
      )}
      <TaskModalDetails />
    </>
  )
}
