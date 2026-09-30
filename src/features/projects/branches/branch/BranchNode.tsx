import { useCallback } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { cn } from "@/features/shared/lib/utils"
import type { BranchNode as BranchNodeModel } from "@/features/projects/lib/project-branch"
import TaskAddBar from "@/features/tasks/components/TaskAddBar"
import { BRANCH_ROW_PREFIX, BRANCH_TASK_PREFIX } from "../lib/branch-dnd"
import BranchNodeContent from "./BranchNodeContent"
import { useBranchDndContext } from "./BranchDndContext"

type BranchNodeProps = {
  node: BranchNodeModel
  expanded: Set<number>
  onToggle: (id: number) => void
  projectId: number
  projectStartDate?: string | null
  projectDueDate?: string | null
}

function BranchChildren({
  nodes,
  expanded,
  onToggle,
  projectId,
  projectStartDate,
  projectDueDate,
}: {
  nodes: BranchNodeModel[]
  expanded: Set<number>
  onToggle: (id: number) => void
  projectId: number
  projectStartDate?: string | null
  projectDueDate?: string | null
}) {
  return (
    <div className="animate-in fade-in duration-200 slide-in-from-top-1 flex flex-col gap-2">
      {nodes.map((node) => (
        <BranchNode
          key={node.task.id_task}
          node={node}
          expanded={expanded}
          onToggle={onToggle}
          projectId={projectId}
          projectStartDate={projectStartDate}
          projectDueDate={projectDueDate}
        />
      ))}
    </div>
  )
}

export default function BranchNode({
  node,
  expanded,
  onToggle,
  projectId,
  projectStartDate,
  projectDueDate,
}: BranchNodeProps) {
  const isOpen = expanded.has(node.task.id_task)
  const hasChildren = node.children.length > 0
  const taskId = node.task.id_task

  const { activeId, target, dimmedIds, enabled } = useBranchDndContext()

  const draggable = useDraggable({
    id: `${BRANCH_TASK_PREFIX}${taskId}`,
    disabled: !enabled,
    data: { task: node.task },
  })
  const droppable = useDroppable({ id: `${BRANCH_ROW_PREFIX}${taskId}` })

  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      draggable.setNodeRef(element)
      droppable.setNodeRef(element)
    },
    [draggable.setNodeRef, droppable.setNodeRef],
  )

  const isDragging = activeId === taskId
  const isDimmed = dimmedIds.has(taskId) && !isDragging
  const dropZone = target?.overId === taskId ? target.zone : null

  return (
    <div className={cn("flex flex-col", isDimmed && "opacity-40")}>
      <BranchNodeContent
        node={node}
        isOpen={isOpen}
        onToggle={() => onToggle(taskId)}
        projectId={projectId}
        projectStartDate={projectStartDate}
        projectDueDate={projectDueDate}
        setNodeRef={setNodeRef}
        dropZone={dropZone}
        isDragging={isDragging}
        dragHandle={{
          listeners: draggable.listeners,
          attributes: draggable.attributes,
          isDragging,
          enabled,
        }}
      />

      {isOpen && (
        <div className="ml-3 mt-2 border-l border-dashed border-border pl-3 sm:ml-4">
          {hasChildren && (
            <BranchChildren
              nodes={node.children}
              expanded={expanded}
              onToggle={onToggle}
              projectId={projectId}
              projectStartDate={projectStartDate}
              projectDueDate={projectDueDate}
            />
          )}
          <div className={cn(hasChildren && "pt-2")}>
            <TaskAddBar projectId={projectId} parentTaskId={taskId} />
          </div>
        </div>
      )}
    </div>
  )
}
