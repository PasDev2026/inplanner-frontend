import { useCallback } from "react"
import {
  useDraggable,
  useDroppable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import { TableRow } from "@/components/ui/table"
import { cn } from "@/features/shared/lib/utils"
import { GripVertical } from "lucide-react"
import { useTaskDndContext } from "./TaskDndContext"

export type TaskDndProps = {
  listeners: DraggableSyntheticListeners | undefined
  attributes: DraggableAttributes
  isDragging: boolean
}

export function useTaskRowDnd(params: {
  task: BackendTask
  canEdit: boolean
}): TaskDndProps & { setNodeRef: (node: HTMLElement | null) => void } {
  const draggable = useDraggable({
    id: `task-${params.task.id_task}`,
    disabled: !params.canEdit,
    data: { task: params.task },
  })
  const droppable = useDroppable({
    id: `row-${params.task.id_task}`,
  })

  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      draggable.setNodeRef(node)
      droppable.setNodeRef(node)
    },
    [draggable.setNodeRef, droppable.setNodeRef],
  )

  return {
    listeners: draggable.listeners,
    attributes: draggable.attributes,
    isDragging: draggable.isDragging,
    setNodeRef,
  }
}

type TaskRowDndProps = {
  task: BackendTask
  canEdit: boolean
  className?: string
  expandedContent?: React.ReactNode
  children: (dnd: TaskDndProps) => React.ReactNode
}

export function TaskRowDnd({
  task,
  canEdit,
  className,
  expandedContent,
  children,
}: TaskRowDndProps) {
  const { listeners, attributes, isDragging, setNodeRef } = useTaskRowDnd({
    task,
    canEdit,
  })
  const dropTarget = useTaskDndContext()
  const isInside =
    dropTarget?.overId === task.id_task && dropTarget.zone === "inside"

  return (
    <>
      <TableRow
        ref={setNodeRef}
        className={cn(
          className,
          isDragging && "opacity-40",
          isInside && "bg-brand-primary/5 ring-2 ring-inset ring-brand-primary",
        )}
      >
        {children({ listeners, attributes, isDragging })}
      </TableRow>
      {expandedContent}
    </>
  )
}

export function TaskDragHandle({
  listeners,
  attributes,
  isDragging,
}: TaskDndProps) {
  return (
    <button
      type="button"
      title="Arrastrar para reordenar"
      {...listeners}
      {...attributes}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all flex-shrink-0",
        "opacity-0 group-hover:opacity-100",
        isDragging && "opacity-100",
      )}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <GripVertical className="h-3.5 w-3.5" />
    </button>
  )
}
