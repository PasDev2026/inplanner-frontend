import { useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronRight } from "lucide-react"
import CircularProgress from "@/components/ui/CircularProgress"
import EditableName from "@/features/projects/components/EditableName"
import { cn } from "@/features/shared/lib/utils"
import type { BranchNode } from "@/features/projects/lib/project-branch"
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations"
import TaskControls from "@/features/tasks/components/TaskControls"
import type { BranchDropZone } from "../lib/branch-dnd"
import BranchDragHandle, { type BranchDragHandleProps } from "./BranchDragHandle"

type BranchNodeContentProps = {
  node: BranchNode
  isOpen: boolean
  onToggle: () => void
  projectId: number
  projectStartDate?: string | null
  projectDueDate?: string | null
  setNodeRef: (element: HTMLElement | null) => void
  dropZone: BranchDropZone | null
  isDragging: boolean
  dragHandle: BranchDragHandleProps & { enabled: boolean }
}

export default function BranchNodeContent({
  node,
  isOpen,
  onToggle,
  projectId,
  projectStartDate,
  projectDueDate,
  setNodeRef,
  dropZone,
  isDragging,
  dragHandle,
}: BranchNodeContentProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { renameMutation } = useTaskMutations(projectId)
  const hasChildren = node.children.length > 0

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-start gap-2 rounded-xl border border-border bg-card px-2.5 py-2 shadow-sm transition-all",
        "hover:border-brand-primary/40 hover:shadow-md",
        isOpen && "border-brand-primary/40",
        dropZone === "inside" && "ring-2 ring-brand-primary",
        dropZone === "before" && "border-t-2 border-t-brand-primary",
        dropZone === "after" && "border-b-2 border-b-brand-primary",
        isDragging && "opacity-40",
        "w-full",
      )}
    >
      {dragHandle.enabled && (
        <BranchDragHandle
          listeners={dragHandle.listeners}
          attributes={dragHandle.attributes}
          isDragging={dragHandle.isDragging}
        />
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Contraer rama" : "Expandir rama"}
        className={cn(
          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-foreground",
          hasChildren || isOpen
            ? "text-muted-foreground opacity-100"
            : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <EditableName
              value={node.task.task_name}
              onNavigate={() => navigate(location.pathname + `?viewTask=${node.task.id_task}`)}
              onRename={(name) =>
                renameMutation.mutate({
                  taskId: node.task.id_task,
                  task_name: name,
                  task_description: node.task.task_description ?? "",
                })
              }
              className="text-sm font-medium text-foreground"
            />
          </div>
          {hasChildren && (
            <span className="hidden shrink-0 items-center gap-2 sm:flex">
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {node.completed}/{node.total}
              </span>
              <CircularProgress percentage={node.progress} size="sm" />
            </span>
          )}
        </div>

        <TaskControls
          task={node.task}
          projectId={projectId}
          projectStartDate={projectStartDate}
          projectDueDate={projectDueDate}
        />
      </div>
    </div>
  )
}
