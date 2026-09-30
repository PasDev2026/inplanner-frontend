import { useCallback, useMemo, useRef, useState } from "react"
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
  computeBranchDropTarget,
  makeRowCollisionDetection,
  resolveDropZone,
  type BranchDropTarget,
  type BranchDropZone,
} from "@/features/projects/branches/lib/branch-dnd"
import type { TaskDropTarget } from "../components/TaskDndContext"

export type TaskDrop = {
  taskId: number
  parentId: number | null
  oldParentId: number | null
  index: number
}

type Indicator = { top: number; left: number; width: number }
type DragLike = DragMoveEvent | DragEndEvent

const ROW_PREFIX = "row-"

export function useTaskTableDnD(
  tasks: BackendTask[],
  onDrop: (drop: TaskDrop) => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeTaskRef = useRef<BackendTask | null>(null)
  const [activeTask, setActiveTask] = useState<BackendTask | null>(null)
  const [indicator, setIndicator] = useState<Indicator | null>(null)
  const [dropTarget, setDropTarget] = useState<TaskDropTarget | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )
  const collisionDetection = useMemo(
    () => makeRowCollisionDetection(ROW_PREFIX),
    [],
  )

  const readPointerY = useCallback((event: DragLike): number => {
    const activator = event.activatorEvent as MouseEvent
    return activator.clientY + event.delta.y
  }, [])

  const computeTarget = useCallback(
    (
      event: DragLike,
    ): { overId: number; zone: BranchDropZone; drop: BranchDropTarget } | null => {
      const over = event.over
      const activeId = activeTaskRef.current?.id_task
      if (!over || activeId == null) return null

      const overIdStr = over.id.toString()
      if (!overIdStr.startsWith(ROW_PREFIX)) return null
      const overId = Number(overIdStr.slice(ROW_PREFIX.length))
      if (overId === activeId) return null

      const zone = resolveDropZone(
        readPointerY(event),
        over.rect.top,
        over.rect.height,
      )
      const drop = computeBranchDropTarget({ tasks, activeId, overId, zone })
      return drop ? { overId, zone, drop } : null
    },
    [tasks, readPointerY],
  )

  const reset = useCallback(() => {
    setActiveTask(null)
    setIndicator(null)
    setDropTarget(null)
    activeTaskRef.current = null
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as BackendTask | undefined
    activeTaskRef.current = task ?? null
    setActiveTask(task ?? null)
    setIndicator(null)
    setDropTarget(null)
  }, [])

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const resolved = computeTarget(event)
      if (!resolved) {
        setIndicator(null)
        setDropTarget(null)
        return
      }

      setDropTarget({ overId: resolved.overId, zone: resolved.zone })

      if (resolved.zone === "inside" || !containerRef.current) {
        setIndicator(null)
        return
      }

      const over = event.over!
      const containerRect = containerRef.current.getBoundingClientRect()
      setIndicator({
        top:
          (resolved.zone === "before" ? over.rect.top : over.rect.bottom) -
          containerRect.top,
        left: over.rect.left - containerRect.left,
        width: over.rect.width,
      })
    },
    [computeTarget],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const resolved = computeTarget(event)
      const activeTask = activeTaskRef.current
      if (resolved && activeTask) {
        onDrop({
          taskId: activeTask.id_task,
          parentId: resolved.drop.parentId,
          oldParentId: activeTask.parent_task_id ?? null,
          index: resolved.drop.index,
        })
      }
      reset()
    },
    [computeTarget, onDrop, reset],
  )

  return {
    containerRef,
    activeTask,
    indicator,
    dropTarget,
    sensors,
    collisionDetection,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: reset,
  }
}
