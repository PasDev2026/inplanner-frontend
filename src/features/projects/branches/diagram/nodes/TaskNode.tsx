import { Handle, Position, type NodeProps } from "@xyflow/react"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { cn } from "@/features/shared/lib/utils"
import type { TaskFlowNode } from "../types"
import NodeAssignees from "./parts/NodeAssignees"
import NodeDueDate from "./parts/NodeDueDate"
import NodePriorityDot from "./parts/NodePriorityDot"
import NodeProgress from "./parts/NodeProgress"
import NodeStatusIcon from "./parts/NodeStatusIcon"
import NodeToggle from "./parts/NodeToggle"

export default function TaskNode({ id, data }: NodeProps<TaskFlowNode>) {
  const statusLabel = TASK_STATUS_MAP[data.task.status]?.label ?? "Sin estado"

  return (
    <div
      role="treeitem"
      tabIndex={0}
      aria-label={`${data.task.task_name}, ${statusLabel}`}
      onClick={() => data.onSelect(data.task.id_task)}
      onKeyDown={(event) => {
        if (event.key === "Enter") data.onSelect(data.task.id_task)
      }}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-sm transition-colors",
        "hover:border-info/50 focus-visible:border-info focus-visible:outline-none",
      )}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <NodeToggle
        hasChildren={data.hasChildren}
        expanded={data.expanded}
        onToggle={() => data.onToggle(id)}
      />
      <NodeStatusIcon status={data.task.status} kind="task" />
      <NodePriorityDot priority={data.priority} />
      <span
        className="min-w-0 flex-1 truncate text-sm text-foreground"
        title={data.task.task_name}
      >
        {data.task.task_name}
      </span>
      <NodeAssignees assignees={data.assignees} />
      <NodeDueDate dueDate={data.dueDate} />
      <NodeProgress percentage={data.progress} />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}
