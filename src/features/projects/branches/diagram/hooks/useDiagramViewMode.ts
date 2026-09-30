import { useCallback, useState } from "react"
import {
  readDiagramMode,
  writeDiagramMode,
  type DiagramViewMode,
} from "../lib/diagram-storage"

export function useDiagramViewMode(projectId: number) {
  const [mode, setModeState] = useState<DiagramViewMode>(() =>
    readDiagramMode(projectId),
  )

  const setMode = useCallback(
    (next: DiagramViewMode) => {
      setModeState(next)
      writeDiagramMode(projectId, next)
    },
    [projectId],
  )

  return { mode, setMode }
}
