import type { BackendTask } from "@/features/shared/lib/types"

export interface BranchNode {
  task: BackendTask
  total: number
  completed: number
  progress: number
  children: BranchNode[]
}

interface SubtreeStats {
  total: number
  completed: number
}

const COMPLETED_STATUS = 4

function sortByPosition(a: BackendTask, b: BackendTask): number {
  return (a.position ?? 0) - (b.position ?? 0) || a.id_task - b.id_task
}

/**
 * Agrupa las tareas por su padre. Las tareas cuyo `parent_task_id` no existe en
 * el conjunto (huérfanas) se consideran raíz para no perderlas.
 */
export function buildChildrenMap(
  tasks: BackendTask[],
): Map<number | null, BackendTask[]> {
  const ids = new Set(tasks.map((task) => task.id_task))
  const map = new Map<number | null, BackendTask[]>()

  for (const task of tasks) {
    const parent =
      task.parent_task_id != null && ids.has(task.parent_task_id)
        ? task.parent_task_id
        : null
    const list = map.get(parent)
    if (list) list.push(task)
    else map.set(parent, [task])
  }

  for (const list of map.values()) list.sort(sortByPosition)
  return map
}

function computeStats(
  task: BackendTask,
  childrenMap: Map<number | null, BackendTask[]>,
  memo: Map<number, SubtreeStats>,
): SubtreeStats {
  const cached = memo.get(task.id_task)
  if (cached) return cached

  let total = 1
  let completed = task.status === COMPLETED_STATUS ? 1 : 0

  for (const child of childrenMap.get(task.id_task) ?? []) {
    const childStats = computeStats(child, childrenMap, memo)
    total += childStats.total
    completed += childStats.completed
  }

  const stats = { total, completed }
  memo.set(task.id_task, stats)
  return stats
}

function toProgress(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

/**
 * Construye el árbol de ramas (tareas de primera generación y descendientes)
 * con el avance de cada rama calculado sobre su subárbol, incluyendo la propia
 * rama (misma fórmula que el backend: tareas completadas / total).
 */
export function buildBranchTree(tasks: BackendTask[]): BranchNode[] {
  const childrenMap = buildChildrenMap(tasks)
  const memo = new Map<number, SubtreeStats>()

  const build = (task: BackendTask): BranchNode => {
    const stats = computeStats(task, childrenMap, memo)
    return {
      task,
      total: stats.total,
      completed: stats.completed,
      progress: toProgress(stats.completed, stats.total),
      children: (childrenMap.get(task.id_task) ?? []).map(build),
    }
  }

  return (childrenMap.get(null) ?? []).map(build)
}

export function flattenBranchTasks(roots: BranchNode[]): BackendTask[] {
  const tasks: BackendTask[] = []
  const walk = (nodes: BranchNode[]) => {
    for (const node of nodes) {
      tasks.push(node.task)
      walk(node.children)
    }
  }
  walk(roots)
  return tasks
}

export function findBranchNode(
  roots: BranchNode[],
  id: number,
): BranchNode | undefined {
  for (const node of roots) {
    if (node.task.id_task === id) return node
    const found = findBranchNode(node.children, id)
    if (found) return found
  }
  return undefined
}
