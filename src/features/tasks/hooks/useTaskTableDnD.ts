import { useCallback, useRef, useState } from "react"
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { BackendTask } from "@/features/shared/lib/types"
import {
  TASK_CELL_LEFT,
  TASK_INDENT,
  computeDropTarget,
  verticalRowCollisionDetection,
  type TaskDndRowData,
  type TaskDrop,
} from "@/features/tasks/lib/task-tree-dnd"

type Indicator = { top: number; left: number; width: number }

export function useTaskTableDnD(onDrop: (drop: TaskDrop) => void) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pointerOffset = useRef({ x: 0, y: 0 })
  const lastTarget = useRef<TaskDrop | null>(null)
  const [activeTask, setActiveTask] = useState<BackendTask | null>(null)
  const [indicator, setIndicator] = useState<Indicator | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as BackendTask | undefined
    setActiveTask(task ?? null)
    lastTarget.current = null
    setIndicator(null)
    const initial = event.active.rect.current.initial
    const activator = event.activatorEvent as MouseEvent
    if (initial) {
      pointerOffset.current = {
        x: activator.clientX - initial.left,
        y: activator.clientY - initial.top,
      }
    }
  }, [])

  const readPointer = useCallback((event: DragMoveEvent | DragEndEvent) => {
    const translated = event.active.rect.current.translated
    if (!translated) return null
    return {
      x: translated.left + pointerOffset.current.x,
      y: translated.top + pointerOffset.current.y,
    }
  }, [])

  const computeTarget = useCallback(
    (event: DragMoveEvent | DragEndEvent) => {
      const over = event.over
      if (!over || over.id.toString() === event.active.id.toString()) return null
      const row = over.data?.current as TaskDndRowData | undefined
      const pointer = readPointer(event)
      if (!row || !pointer) return null
      return computeDropTarget({ row, rect: over.rect, pointerX: pointer.x, pointerY: pointer.y })
    },
    [readPointer],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const over = event.over
      if (!over || over.id.toString() === event.active.id.toString()) {
        lastTarget.current = null
        setIndicator(null)
        return
      }
      const row = over.data?.current as TaskDndRowData | undefined
      const pointer = readPointer(event)
      if (!row || !pointer || !containerRef.current) {
        lastTarget.current = null
        setIndicator(null)
        return
      }
      const target = computeTarget(event)
      if (!target) {
        lastTarget.current = null
        setIndicator(null)
        return
      }
      const taskId = Number(event.active.id.toString().replace("task-", ""))
      const task = event.active.data?.current?.task as BackendTask | undefined
      lastTarget.current = {
        taskId,
        parentId: target.parentId,
        oldParentId: task?.parent_task_id ?? null,
        index: target.index,
      }

      const cRect = containerRef.current.getBoundingClientRect()
      const midY = over.rect.top + over.rect.height / 2
      const top = (pointer.y < midY ? over.rect.top : over.rect.bottom) - cRect.top
      const left = over.rect.left - cRect.left + TASK_CELL_LEFT + target.depth * TASK_INDENT
      const width = Math.max(80, over.rect.right - cRect.left - left - 80)
      setIndicator({ top, left, width })
    },
    [computeTarget, readPointer],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const drop = lastTarget.current
      if (drop) onDrop(drop)
      setActiveTask(null)
      lastTarget.current = null
      setIndicator(null)
      void event
    },
    [onDrop],
  )

  const handleDragCancel = useCallback((event: DragCancelEvent) => {
    setActiveTask(null)
    lastTarget.current = null
    setIndicator(null)
    void event
  }, [])

  return {
    containerRef,
    activeTask,
    indicator,
    sensors,
    collisionDetection: verticalRowCollisionDetection,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }
}
