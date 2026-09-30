import { GAP_X, GAP_Y, NODE_H, NODE_W } from "./constants"

export interface LayoutItem {
  id: string
  parentId: string | null
}

export interface LayoutPosition {
  x: number
  y: number
}

/**
 * Layout de árbol "tidy" horizontal para nodos de tamaño fijo.
 * x = profundidad * (NODE_W + GAP_X); cada hoja ocupa un "slot" vertical y
 * los padres se centran respecto a sus hijos.
 */
export function computeLayout(
  items: LayoutItem[],
): Map<string, LayoutPosition> {
  const present = new Set(items.map((item) => item.id))
  const children = new Map<string, string[]>()
  const roots: string[] = []

  for (const item of items) {
    if (item.parentId && present.has(item.parentId)) {
      const list = children.get(item.parentId) ?? []
      list.push(item.id)
      children.set(item.parentId, list)
    } else {
      roots.push(item.id)
    }
  }

  const positions = new Map<string, LayoutPosition>()
  let nextY = 0

  const walk = (id: string, depth: number): number => {
    const kids = children.get(id) ?? []
    const x = depth * (NODE_W + GAP_X)

    if (kids.length === 0) {
      const y = nextY
      nextY += NODE_H + GAP_Y
      positions.set(id, { x, y })
      return y
    }

    const kidYs = kids.map((kid) => walk(kid, depth + 1))
    const y = (kidYs[0] + kidYs[kidYs.length - 1]) / 2
    positions.set(id, { x, y })
    return y
  }

  roots.forEach((root) => walk(root, 0))

  return positions
}
