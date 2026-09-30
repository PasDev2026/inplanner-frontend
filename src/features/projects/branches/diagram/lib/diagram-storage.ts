export interface DiagramPosition {
  x: number
  y: number
}

export type DiagramPositions = Record<string, DiagramPosition>

export type DiagramViewMode = "structure" | "organize"

const positionsKey = (projectId: number) => `inplanner:diagram:${projectId}`
const modeKey = (projectId: number) => `inplanner:diagram-mode:${projectId}`

export function readDiagramPositions(projectId: number): DiagramPositions {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(positionsKey(projectId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object"
      ? (parsed as DiagramPositions)
      : {}
  } catch {
    return {}
  }
}

export function writeDiagramPositions(
  projectId: number,
  positions: DiagramPositions,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(positionsKey(projectId), JSON.stringify(positions))
  } catch {
    // almacenamiento no disponible o cuota llena: se ignora
  }
}

export function clearDiagramPositions(projectId: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(positionsKey(projectId))
  } catch {
    // noop
  }
}

export function readDiagramMode(projectId: number): DiagramViewMode {
  if (typeof window === "undefined") return "structure"
  return window.localStorage.getItem(modeKey(projectId)) === "organize"
    ? "organize"
    : "structure"
}

export function writeDiagramMode(projectId: number, mode: DiagramViewMode): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(modeKey(projectId), mode)
  } catch {
    // noop
  }
}
