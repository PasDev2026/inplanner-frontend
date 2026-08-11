import type { CollisionDetection } from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import type { QueryClient } from "@tanstack/react-query"
import { TASK_CHILDREN_KEY, DASHBOARD_TASKS_KEY } from "@/features/tasks/lib/task-keys"
import { PROJECT_TASKS_KEY } from "@/features/projects/lib/project-keys"

export type TaskDrop = {
  taskId: number
  parentId: number | null
  oldParentId: number | null
  index: number
}

export const TASK_INDENT = 24
export const TASK_CELL_LEFT = 40
export const TASK_NAME_OFFSET = 24

export type TaskDndAncestor = { taskId: number; index: number }

export type TaskDndRowData = {
  taskId: number
  parentTaskId: number | null
  depth: number
  siblingIndex: number
  ancestors: TaskDndAncestor[]
  subtasksCount: number
}

export type DropTarget = {
  parentId: number | null
  index: number
  depth: number
}

export function computeDropTarget(params: {
  row: TaskDndRowData
  rect: { left: number; top: number; right: number; bottom: number; height: number }
  pointerX: number
  pointerY: number
}): DropTarget {
  const { row, rect } = params
  const midY = rect.top + rect.height / 2
  const slot = params.pointerY < midY ? "before" : "after"
  const nameStartX =
    rect.left + TASK_CELL_LEFT + row.depth * TASK_INDENT + TASK_NAME_OFFSET
  const depth = Math.max(
    0,
    Math.min(
      row.depth + 1,
      row.depth + Math.round((params.pointerX - nameStartX) / TASK_INDENT),
    ),
  )

  if (depth === row.depth + 1) {
    return {
      parentId: row.taskId,
      index: slot === "after" ? row.subtasksCount : 0,
      depth,
    }
  }

  const sibling =
    depth === row.depth
      ? { taskId: row.taskId, index: row.siblingIndex }
      : row.ancestors[depth]
  const parentId =
    depth === 0 ? null : (row.ancestors[depth - 1]?.taskId ?? null)

  return {
    parentId,
    index: (sibling?.index ?? 0) + (slot === "after" ? 1 : 0),
    depth,
  }
}

export const verticalRowCollisionDetection: CollisionDetection = (args) => {
  const { pointerCoordinates, droppableRects, droppableContainers } = args
  const py = pointerCoordinates?.y ?? 0

  let bestId: string | null = null
  let bestDist = Infinity
  for (const container of droppableContainers) {
    const id = String(container.id)
    if (!id.startsWith("row-")) continue
    const rect = droppableRects.get(container.id)
    if (!rect) continue
    const dist = Math.abs(py - (rect.top + rect.height / 2))
    if (dist < bestDist) {
      bestDist = dist
      bestId = id
    }
  }

  return bestId ? [{ id: bestId }] : []
}

export function moveTaskInList(
  list: BackendTask[],
  taskId: number,
  insert: boolean,
  index: number,
  parentTaskId: number | null,
): BackendTask[] {
  const item = list.find((t) => t.id_task === taskId)
  if (!item) return list
  const rest = list.filter((t) => t.id_task !== taskId)
  if (!insert) return rest
  const updated = { ...item, parent_task_id: parentTaskId }
  const idx = Math.min(Math.max(0, Math.round(index)), rest.length)
  return [...rest.slice(0, idx), updated, ...rest.slice(idx)]
}

export function applyMoveInCache(
  queryClient: QueryClient,
  projectId: number,
  drop: TaskDrop,
): void {
  const { taskId, parentId, oldParentId, index } = drop

  const rootKeys = [PROJECT_TASKS_KEY(projectId), DASHBOARD_TASKS_KEY(projectId)]
  for (const key of rootKeys) {
    const data = queryClient.getQueryData<{ data: BackendTask[] }>(key)
    if (data) {
      queryClient.setQueryData(key, {
        ...data,
        data: moveTaskInList(data.data, taskId, parentId == null, index, null),
      })
    }
  }

  const parentIds = [...new Set([oldParentId, parentId])].filter(
    (p): p is number => p != null,
  )
  for (const pid of parentIds) {
    const key = TASK_CHILDREN_KEY(pid)
    const data = queryClient.getQueryData<BackendTask[]>(key)
    if (data) {
      queryClient.setQueryData(
        key,
        moveTaskInList(data, taskId, parentId === pid, index, pid),
      )
    }
  }
}
