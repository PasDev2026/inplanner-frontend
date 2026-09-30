import type { CollisionDetection } from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import { buildChildrenMap } from "@/features/projects/lib/project-branch"

export type BranchDropZone = "before" | "inside" | "after"

export interface BranchDropTarget {
  parentId: number | null
  index: number
}

export const BRANCH_ROW_PREFIX = "branch-row-"
export const BRANCH_TASK_PREFIX = "branch-task-"

const BEFORE_RATIO = 0.3
const AFTER_RATIO = 0.7

/** Zona del drop según la posición vertical del puntero dentro de la tarjeta. */
export function resolveDropZone(
  pointerY: number,
  top: number,
  height: number,
): BranchDropZone {
  const ratio = height > 0 ? (pointerY - top) / height : 0.5
  if (ratio < BEFORE_RATIO) return "before"
  if (ratio > AFTER_RATIO) return "after"
  return "inside"
}

function isDescendant(
  nodeId: number,
  ancestorId: number,
  tasksById: Map<number, BackendTask>,
): boolean {
  let cursor = tasksById.get(nodeId)?.parent_task_id ?? null
  while (cursor != null) {
    if (cursor === ancestorId) return true
    cursor = tasksById.get(cursor)?.parent_task_id ?? null
  }
  return false
}

/**
 * Calcula el padre y el índice destino al soltar una tarea sobre otra.
 * El índice se calcula excluyendo la tarea activa (semántica del backend).
 * Devuelve null si el destino es inválido (sobre sí misma o dentro de su
 * propio subárbol).
 */
export function computeBranchDropTarget(params: {
  tasks: BackendTask[]
  activeId: number
  overId: number
  zone: BranchDropZone
}): BranchDropTarget | null {
  const { tasks, activeId, overId, zone } = params
  if (activeId === overId) return null

  const tasksById = new Map(tasks.map((task) => [task.id_task, task]))
  const over = tasksById.get(overId)
  if (!over || !tasksById.has(activeId)) return null
  if (isDescendant(overId, activeId, tasksById)) return null

  const childrenMap = buildChildrenMap(tasks)

  if (zone === "inside") {
    return { parentId: overId, index: (childrenMap.get(overId) ?? []).length }
  }

  const parentId = over.parent_task_id ?? null
  const siblings = (childrenMap.get(parentId) ?? []).filter(
    (task) => task.id_task !== activeId,
  )
  const overIndex = siblings.findIndex((task) => task.id_task === overId)
  if (overIndex === -1) return null

  return {
    parentId,
    index: overIndex + (zone === "after" ? 1 : 0),
  }
}

export function makeRowCollisionDetection(prefix: string): CollisionDetection {
  return (args) => {
    const { pointerCoordinates, droppableRects, droppableContainers } = args
    const py = pointerCoordinates?.y ?? 0

    let bestId: string | null = null
    let bestDist = Infinity
    for (const container of droppableContainers) {
      const id = String(container.id)
      if (!id.startsWith(prefix)) continue
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
}

export const branchCollisionDetection = makeRowCollisionDetection(
  BRANCH_ROW_PREFIX,
)
