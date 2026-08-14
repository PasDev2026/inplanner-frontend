import { createContext, useState, useCallback, useMemo, useContext } from 'react'

interface ExpandStateContextType {
  expandedProjects: Set<number>
  expandedTasks: Set<number>
  toggleProject: (id: number) => void
  toggleTask: (id: number) => void
  expandProjects: (ids: Set<number>) => void
  expandTasks: (ids: Set<number>) => void
}

export const ExpandStateContext = createContext<ExpandStateContextType | undefined>(undefined)

function useSetToggle(setter: React.Dispatch<React.SetStateAction<Set<number>>>) {
  return useCallback((id: number) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [setter])
}

function useSetExpand(setter: React.Dispatch<React.SetStateAction<Set<number>>>) {
  return useCallback((ids: Set<number>) => {
    if (ids.size === 0) return
    setter((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }, [setter])
}

export function ExpandStateProvider({ children }: { children: React.ReactNode }) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set())
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
  const toggleProject = useSetToggle(setExpandedProjects)
  const toggleTask = useSetToggle(setExpandedTasks)
  const expandProjects = useSetExpand(setExpandedProjects)
  const expandTasks = useSetExpand(setExpandedTasks)

  const value = useMemo(() => ({
    expandedProjects,
    expandedTasks,
    toggleProject,
    toggleTask,
    expandProjects,
    expandTasks,
  }), [expandedProjects, expandedTasks, toggleProject, toggleTask, expandProjects, expandTasks])

  return (
    <ExpandStateContext.Provider value={value}>
      {children}
    </ExpandStateContext.Provider>
  )
}

export function useExpandState(): ExpandStateContextType {
  const ctx = useContext(ExpandStateContext)
  if (!ctx) {
    throw new Error('useExpandState must be used within an ExpandStateProvider')
  }
  return ctx
}
