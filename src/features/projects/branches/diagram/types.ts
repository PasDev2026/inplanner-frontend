import type { Node } from "@xyflow/react"
import type { BackendTask } from "@/features/shared/lib/types"

export interface DiagramAssignee {
  user_id: string
  name?: string | null
  apellido_paterno?: string | null
}

export interface ProjectNodeData extends Record<string, unknown> {
  name: string
  status: number
  progress: number
  priority: number | null
  dueDate: string | null
  assignees: DiagramAssignee[]
  hasChildren: boolean
  expanded: boolean
  onToggle: (id: string) => void
}

export interface TaskNodeData extends Record<string, unknown> {
  task: BackendTask
  progress: number
  total: number
  completed: number
  priority: number | null
  dueDate: string | null
  assignees: DiagramAssignee[]
  hasChildren: boolean
  expanded: boolean
  onToggle: (id: string) => void
  onSelect: (taskId: number) => void
}

export type ProjectFlowNode = Node<ProjectNodeData, "project">
export type TaskFlowNode = Node<TaskNodeData, "task">
export type DiagramFlowNode = ProjectFlowNode | TaskFlowNode
