import { createContext, useContext } from "react"
import type { BranchDropZone } from "@/features/projects/branches/lib/branch-dnd"

export type TaskDropTarget = {
  overId: number
  zone: BranchDropZone
}

const TaskDndContext = createContext<TaskDropTarget | null>(null)

export const TaskDndProvider = TaskDndContext.Provider

export function useTaskDndContext(): TaskDropTarget | null {
  return useContext(TaskDndContext)
}
