import { useMemo, useState } from "react"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import {
  findBranchNode,
  flattenBranchTasks,
  type BranchNode as BranchNodeModel,
} from "@/features/projects/lib/project-branch"
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations"
import { useBranchDnD } from "./hooks/useBranchDnD"
import { BranchDndProvider } from "./branch/BranchDndContext"
import BranchEmptyState from "./branch/BranchEmptyState"
import BranchNode from "./branch/BranchNode"

type BranchTreeProps = {
  roots: BranchNodeModel[]
  projectId: number
  projectStartDate?: string | null
  projectDueDate?: string | null
  canImport?: boolean
  emptyLabel?: string
}

const EMPTY_IDS: ReadonlySet<number> = new Set()

export default function BranchTree({
  roots,
  projectId,
  projectStartDate,
  projectDueDate,
  canImport = false,
  emptyLabel = "Sin tareas",
}: BranchTreeProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const { reorderMutation } = useTaskMutations(projectId)

  const flatTasks = useMemo(() => flattenBranchTasks(roots), [roots])

  const dnd = useBranchDnD({
    tasks: flatTasks,
    onDrop: (activeId, drop) =>
      reorderMutation.mutate({
        taskId: activeId,
        parentTaskId: drop.parentId,
        position: drop.index,
      }),
  })

  const dimmedIds = useMemo(() => {
    if (dnd.activeId == null) return EMPTY_IDS
    const node = findBranchNode(roots, dnd.activeId)
    if (!node) return EMPTY_IDS
    const ids = new Set<number>()
    const walk = (current: BranchNodeModel) => {
      ids.add(current.task.id_task)
      current.children.forEach(walk)
    }
    walk(node)
    return ids
  }, [dnd.activeId, roots])

  const descendantCount = useMemo(() => {
    if (dnd.activeId == null) return 0
    const node = findBranchNode(roots, dnd.activeId)
    return node ? node.total - 1 : 0
  }, [dnd.activeId, roots])

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (roots.length === 0) {
    return <BranchEmptyState label={emptyLabel} />
  }

  return (
    <BranchDndProvider
      value={{ activeId: dnd.activeId, target: dnd.target, dimmedIds, enabled: true }}
    >
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={dnd.collisionDetection}
        onDragStart={dnd.onDragStart}
        onDragMove={dnd.onDragMove}
        onDragEnd={dnd.onDragEnd}
        onDragCancel={dnd.onDragCancel}
      >
        <div className="flex flex-col gap-2">
          {roots.map((node) => (
            <BranchNode
              key={node.task.id_task}
              node={node}
              expanded={expanded}
              onToggle={toggle}
              projectId={projectId}
              projectStartDate={projectStartDate}
              projectDueDate={projectDueDate}
              canImport={canImport}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {dnd.activeTask ? (
            <div className="max-w-xs rounded-xl border border-brand-primary bg-card px-3 py-2 shadow-xl">
              <p className="truncate text-sm font-medium text-foreground">
                {dnd.activeTask.task_name}
              </p>
              {descendantCount > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  +{descendantCount} {descendantCount === 1 ? "subtarea" : "subtareas"}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </BranchDndProvider>
  )
}
