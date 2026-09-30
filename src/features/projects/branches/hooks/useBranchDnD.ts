import { useCallback, useRef, useState } from "react"
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import {
  BRANCH_ROW_PREFIX,
  BRANCH_TASK_PREFIX,
  branchCollisionDetection,
  computeBranchDropTarget,
  resolveDropZone,
  type BranchDropTarget,
  type BranchDropZone,
} from "../lib/branch-dnd"

export type BranchDndTarget = {
  overId: number
  zone: BranchDropZone
  drop: BranchDropTarget
}

type DragLike = DragMoveEvent | DragEndEvent

export function useBranchDnD(params: {
  tasks: BackendTask[]
  onDrop: (activeId: number, drop: BranchDropTarget) => void
}) {
  const { tasks, onDrop } = params
  const activeIdRef = useRef<number | null>(null)
  const [activeTask, setActiveTask] = useState<BackendTask | null>(null)
  const [target, setTarget] = useState<BranchDndTarget | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as BackendTask | undefined
    activeIdRef.current =
      task?.id_task ??
      Number(String(event.active.id).slice(BRANCH_TASK_PREFIX.length))
    setActiveTask(task ?? null)
    setTarget(null)
  }, [])

  const resolveTarget = useCallback(
    (event: DragLike): BranchDndTarget | null => {
      const overIdStr = event.over?.id?.toString()
      const activeId = activeIdRef.current
      if (!overIdStr?.startsWith(BRANCH_ROW_PREFIX) || activeId == null) {
        return null
      }
      const overId = Number(overIdStr.slice(BRANCH_ROW_PREFIX.length))
      if (overId === activeId) return null

      const activator = event.activatorEvent as MouseEvent
      const pointerY = activator.clientY + event.delta.y
      const zone = resolveDropZone(
        pointerY,
        event.over!.rect.top,
        event.over!.rect.height,
      )
      const drop = computeBranchDropTarget({ tasks, activeId, overId, zone })
      return drop ? { overId, zone, drop } : null
    },
    [tasks],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => setTarget(resolveTarget(event)),
    [resolveTarget],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const resolved = resolveTarget(event)
      const activeId = activeIdRef.current
      if (resolved && activeId != null) onDrop(activeId, resolved.drop)
      setActiveTask(null)
      setTarget(null)
      activeIdRef.current = null
    },
    [onDrop, resolveTarget],
  )

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setTarget(null)
    activeIdRef.current = null
  }, [])

  return {
    sensors,
    collisionDetection: branchCollisionDetection,
    activeId: activeTask?.id_task ?? null,
    activeTask,
    target,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }
}
