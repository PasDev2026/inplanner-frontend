import { GripVertical } from "lucide-react"
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core"
import { cn } from "@/features/shared/lib/utils"

export type BranchDragHandleProps = {
  listeners: DraggableSyntheticListeners | undefined
  attributes: DraggableAttributes
  isDragging: boolean
}

export default function BranchDragHandle({
  listeners,
  attributes,
  isDragging,
}: BranchDragHandleProps) {
  return (
    <button
      type="button"
      title="Arrastrar para mover"
      {...listeners}
      {...attributes}
      onClick={(event) => event.stopPropagation()}
      style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
      className={cn(
        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 opacity-0 transition-all",
        "hover:bg-muted hover:text-foreground group-hover:opacity-100",
        isDragging && "opacity-100",
      )}
    >
      <GripVertical className="h-3.5 w-3.5" />
    </button>
  )
}
