import { describe, expect, it } from "vitest"
import { computeDropTarget } from "./task-tree-dnd"
import type { TaskDndRowData } from "./task-tree-dnd"

function row(overrides: Partial<TaskDndRowData>): TaskDndRowData {
  return {
    taskId: 1,
    parentTaskId: null,
    depth: 0,
    siblingIndex: 2,
    ancestors: [],
    subtasksCount: 3,
    ...overrides,
  }
}

const rect = { left: 100, top: 0, right: 700, bottom: 40, height: 40 }

describe("computeDropTarget", () => {
  it("coloca 'después' en el mismo nivel cuando el puntero está a la izquierda", () => {
    const target = computeDropTarget({
      row: row({}),
      rect,
      pointerX: 164,
      pointerY: 30,
    })

    expect(target).toEqual({ parentId: null, index: 3, depth: 0 })
  })

  it("coloca 'antes' en el mismo nivel en la mitad superior", () => {
    const target = computeDropTarget({
      row: row({}),
      rect,
      pointerX: 164,
      pointerY: 10,
    })

    expect(target).toEqual({ parentId: null, index: 2, depth: 0 })
  })

  it("convierte en hijo al desplazarse a la derecha del nombre", () => {
    const target = computeDropTarget({
      row: row({}),
      rect,
      pointerX: 188,
      pointerY: 30,
    })

    expect(target).toEqual({ parentId: 1, index: 3, depth: 1 })
  })

  it("al soltar en la parte superior como hijo inserta al inicio", () => {
    const target = computeDropTarget({
      row: row({}),
      rect,
      pointerX: 188,
      pointerY: 10,
    })

    expect(target).toEqual({ parentId: 1, index: 0, depth: 1 })
  })

  it("saca un nivel (dedent) al arrastrar a la izquierda del nombre", () => {
    const target = computeDropTarget({
      row: row({
        taskId: 20,
        depth: 2,
        siblingIndex: 5,
        ancestors: [
          { taskId: 10, index: 0 },
          { taskId: 11, index: 2 },
        ],
      }),
      rect: { left: 100, top: 100, right: 700, bottom: 140, height: 40 },
      pointerX: 100,
      pointerY: 110,
    })

    expect(target).toEqual({ parentId: null, index: 0, depth: 0 })
  })

  it("inserta antes de un ancestro intermedio sin llegar a la raíz", () => {
    const target = computeDropTarget({
      row: row({
        taskId: 20,
        depth: 2,
        siblingIndex: 5,
        ancestors: [
          { taskId: 10, index: 0 },
          { taskId: 11, index: 2 },
        ],
      }),
      rect: { left: 100, top: 100, right: 700, bottom: 140, height: 40 },
      pointerX: 188,
      pointerY: 110,
    })

    expect(target).toEqual({ parentId: 10, index: 2, depth: 1 })
  })
})
