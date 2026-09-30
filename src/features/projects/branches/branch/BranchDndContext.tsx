import { createContext, useContext } from "react"
import type { BranchDndTarget } from "../hooks/useBranchDnD"

type BranchDndContextValue = {
  activeId: number | null
  target: BranchDndTarget | null
  dimmedIds: ReadonlySet<number>
  enabled: boolean
}

const EMPTY_IDS: ReadonlySet<number> = new Set()

const BranchDndContext = createContext<BranchDndContextValue>({
  activeId: null,
  target: null,
  dimmedIds: EMPTY_IDS,
  enabled: false,
})

export const BranchDndProvider = BranchDndContext.Provider

export function useBranchDndContext(): BranchDndContextValue {
  return useContext(BranchDndContext)
}
