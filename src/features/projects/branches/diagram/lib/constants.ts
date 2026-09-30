export const NODE_W = 300
export const NODE_H = 44
export const GAP_X = 80
export const GAP_Y = 16

export const PROJECT_NODE_PREFIX = "p-"
export const TASK_NODE_PREFIX = "t-"

export const projectNodeId = (projectId: number) => `${PROJECT_NODE_PREFIX}${projectId}`
export const taskNodeId = (taskId: number) => `${TASK_NODE_PREFIX}${taskId}`

export const isTaskNodeId = (id: string): boolean =>
  id.startsWith(TASK_NODE_PREFIX)

export const taskIdFromNodeId = (id: string): number | null =>
  isTaskNodeId(id) ? Number(id.slice(TASK_NODE_PREFIX.length)) : null
