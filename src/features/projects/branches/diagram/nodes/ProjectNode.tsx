import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { ProjectFlowNode } from "../types"
import NodeAssignees from "./parts/NodeAssignees"
import NodeDueDate from "./parts/NodeDueDate"
import NodePriorityDot from "./parts/NodePriorityDot"
import NodeProgress from "./parts/NodeProgress"
import NodeStatusIcon from "./parts/NodeStatusIcon"
import NodeToggle from "./parts/NodeToggle"

export default function ProjectNode({ id, data }: NodeProps<ProjectFlowNode>) {
  return (
    <div
      role="treeitem"
      aria-label={`Proyecto ${data.name}`}
      className="relative flex w-full items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-sm"
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <NodeToggle
        hasChildren={data.hasChildren}
        expanded={data.expanded}
        onToggle={() => data.onToggle(id)}
      />
      <NodeStatusIcon status={data.status} kind="project" />
      <NodePriorityDot priority={data.priority} />
      <span
        className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
        title={data.name}
      >
        {data.name}
      </span>
      <NodeAssignees assignees={data.assignees} />
      <NodeDueDate dueDate={data.dueDate} />
      <NodeProgress percentage={data.progress} />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}
