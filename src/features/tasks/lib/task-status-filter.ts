import type { BackendTask } from "@/features/shared/lib/types"

export function buildVisibleTaskIds(
  tasks: BackendTask[],
  selected: ReadonlySet<number>,
): Set<number> {
  if (selected.size === 0) {
    return new Set(tasks.map((t) => t.id_task))
  }

  const childrenByParent = new Map<number, BackendTask[]>()
  const roots: BackendTask[] = []
  for (const task of tasks) {
    if (task.parent_task_id === null || task.parent_task_id === undefined) {
      roots.push(task)
    } else {
      const siblings = childrenByParent.get(task.parent_task_id)
      if (siblings) {
        siblings.push(task)
      } else {
        childrenByParent.set(task.parent_task_id, [task])
      }
    }
  }

  const visible = new Set<number>()
  const visit = (task: BackendTask): boolean => {
    const children = childrenByParent.get(task.id_task) ?? []
    const hasMatchingDescendant = children.some(visit)
    if (selected.has(task.status) || hasMatchingDescendant) {
      visible.add(task.id_task)
      return true
    }
    return false
  }

  for (const root of roots) {
    visit(root)
  }
  return visible
}

export function filterByStatus<T extends { id_task: number }>(
  nodes: T[],
  visibleTaskIds: ReadonlySet<number>,
): T[] {
  return nodes.filter((n) => visibleTaskIds.has(n.id_task))
}

export function buildForcedOpenTaskIds(
  tasks: BackendTask[],
  visibleTaskIds: ReadonlySet<number>,
  selected: ReadonlySet<number>,
): Set<number> {
  if (selected.size === 0) {
    return new Set()
  }
  const byId = new Map<number, BackendTask>()
  for (const task of tasks) {
    byId.set(task.id_task, task)
  }

  const forcedOpen = new Set<number>()
  for (const task of tasks) {
    if (task.parent_task_id === null || task.parent_task_id === undefined) {
      continue
    }
    if (!visibleTaskIds.has(task.id_task)) {
      continue
    }
    let parent = byId.get(task.parent_task_id)
    while (parent && visibleTaskIds.has(parent.id_task)) {
      forcedOpen.add(parent.id_task)
      parent = parent.parent_task_id != null ? byId.get(parent.parent_task_id) : undefined
    }
  }
  return forcedOpen
}

export function buildDimmedTaskIds(
  tasks: BackendTask[],
  visibleTaskIds: ReadonlySet<number>,
  selected: ReadonlySet<number>,
): Set<number> {
  if (selected.size === 0) {
    return new Set()
  }
  const dimmed = new Set<number>()
  for (const task of tasks) {
    if (visibleTaskIds.has(task.id_task) && !selected.has(task.status)) {
      dimmed.add(task.id_task)
    }
  }
  return dimmed
}
