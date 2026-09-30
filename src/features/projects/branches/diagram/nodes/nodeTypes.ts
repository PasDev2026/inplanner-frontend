import type { NodeTypes } from "@xyflow/react"
import ProjectNode from "./ProjectNode"
import TaskNode from "./TaskNode"

export const diagramNodeTypes = {
  project: ProjectNode,
  task: TaskNode,
} as unknown as NodeTypes
