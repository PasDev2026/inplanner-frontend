import { useCallback, useEffect, useRef, useState } from "react"
import type { BranchNode } from "@/features/projects/lib/project-branch"
import { collectAllExpandedIds } from "../lib/expansion"

export function useDiagramExpansion(projectId: number, roots: BranchNode[]) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const seeded = useRef(false)

  // Siembra una sola vez (todo expandido) cuando llegan las tareas; después
  // respeta lo que el usuario colapse/expanda.
  useEffect(() => {
    if (seeded.current || roots.length === 0) return
    seeded.current = true
    setExpanded(collectAllExpandedIds(projectId, roots))
  }, [projectId, roots])

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return { expanded, toggle }
}
