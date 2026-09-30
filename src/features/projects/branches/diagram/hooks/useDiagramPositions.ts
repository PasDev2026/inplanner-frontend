import { useCallback, useEffect, useRef, useState } from "react"
import {
  clearDiagramPositions,
  readDiagramPositions,
  writeDiagramPositions,
  type DiagramPosition,
  type DiagramPositions,
} from "../lib/diagram-storage"

export function useDiagramPositions(projectId: number) {
  const [positions, setPositions] = useState<DiagramPositions>(() =>
    readDiagramPositions(projectId),
  )
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setPositions(readDiagramPositions(projectId))
  }, [projectId])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const persist = useCallback(
    (next: DiagramPositions) => {
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        writeDiagramPositions(projectId, next)
        timer.current = null
      }, 400)
    },
    [projectId],
  )

  const setPosition = useCallback(
    (id: string, position: DiagramPosition) => {
      setPositions((prev) => {
        const next = { ...prev, [id]: position }
        persist(next)
        return next
      })
    },
    [persist],
  )

  const reset = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setPositions({})
    clearDiagramPositions(projectId)
  }, [projectId])

  return { positions, setPosition, reset }
}
