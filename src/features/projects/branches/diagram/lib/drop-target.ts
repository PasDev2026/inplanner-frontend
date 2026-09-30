export interface DiagramRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export type DiagramDropZone = "before" | "inside" | "after"

export interface ResolvedDrop {
  overId: string
  zone: DiagramDropZone
}

/**
 * Determina el nodo destino y la zona a partir de la geometría.
 * Si el centro de la activa cae dentro de un candidato → "inside";
 * si no, el candidato más cercano por centro → "before"/"after" según Y.
 */
export function resolveDropTarget(
  active: DiagramRect,
  candidates: DiagramRect[],
): ResolvedDrop | null {
  if (candidates.length === 0) return null

  const activeCx = active.x + active.width / 2
  const activeCy = active.y + active.height / 2

  const containing = candidates.find(
    (candidate) =>
      activeCx >= candidate.x &&
      activeCx <= candidate.x + candidate.width &&
      activeCy >= candidate.y &&
      activeCy <= candidate.y + candidate.height,
  )
  if (containing) {
    return { overId: containing.id, zone: "inside" }
  }

  let nearest: DiagramRect | null = null
  let bestDist = Infinity
  for (const candidate of candidates) {
    const cx = candidate.x + candidate.width / 2
    const cy = candidate.y + candidate.height / 2
    const dist = Math.hypot(activeCx - cx, activeCy - cy)
    if (dist < bestDist) {
      bestDist = dist
      nearest = candidate
    }
  }
  if (!nearest) return null

  const nearestCy = nearest.y + nearest.height / 2
  return { overId: nearest.id, zone: activeCy < nearestCy ? "before" : "after" }
}
