import { describe, expect, it } from "vitest"
import {
  buildDimmedTaskIds,
  buildForcedOpenTaskIds,
  buildVisibleTaskIds,
  filterByStatus,
} from "./task-status-filter"
import type { BackendTask } from "@/features/shared/lib/types"

function task(id: number, status: number, parent: number | null = null): BackendTask {
  return {
    id_task: id,
    task_name: `t${id}`,
    task_description: null,
    project_id: 1,
    parent_task_id: parent,
    created_by_id: "u",
    completed_by_id: null,
    start_date: null,
    due_date: null,
    status,
    priority: null,
    created_at: "",
    updated_at: "",
    position: id,
  }
}

describe("buildVisibleTaskIds", () => {
  it("sin filtro devuelve todas las tareas", () => {
    const tasks = [task(1, 0), task(2, 1, 1)]
    const visible = buildVisibleTaskIds(tasks, new Set())
    expect(visible.size).toBe(2)
  })

  it("incluye tareas cuyo estado coincide", () => {
    const tasks = [task(1, 0), task(2, 2)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    expect(visible.has(2)).toBe(true)
    expect(visible.has(1)).toBe(false)
  })

  it("conserva el padre cuando un descendiente coincide", () => {
    const tasks = [task(1, 0), task(2, 2, 1), task(3, 0, 2)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    expect(visible.has(1)).toBe(true)
    expect(visible.has(2)).toBe(true)
    expect(visible.has(3)).toBe(false)
  })

  it("multi-select: un nodo es visible si coincide con cualquiera", () => {
    const tasks = [task(1, 0), task(2, 4)]
    const visible = buildVisibleTaskIds(tasks, new Set([0, 4]))
    expect(visible.has(1)).toBe(true)
    expect(visible.has(2)).toBe(true)
  })
})

describe("filterByStatus", () => {
  it("filtra nodos por el set de visibles", () => {
    const nodes = [task(1, 0), task(2, 2)]
    const filtered = filterByStatus(nodes, new Set([2]))
    expect(filtered.map((n) => n.id_task)).toEqual([2])
  })
})

describe("buildForcedOpenTaskIds", () => {
  it("abre los ancestros visibles de cada tarea visible", () => {
    const tasks = [task(1, 0), task(2, 0, 1), task(3, 2, 2)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    const forced = buildForcedOpenTaskIds(tasks, visible, new Set([2]))
    expect(forced.has(1)).toBe(true)
    expect(forced.has(2)).toBe(true)
    expect(forced.has(3)).toBe(false)
  })

  it("no fuerza abrir un padre coincidente sin hijos coincidentes", () => {
    const tasks = [task(1, 2), task(2, 0, 1)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    const forced = buildForcedOpenTaskIds(tasks, visible, new Set([2]))
    expect(visible.has(1)).toBe(true)
    expect(forced.has(1)).toBe(false)
  })

  it("sin filtro no fuerza abrir nada aunque todo sea visible", () => {
    const tasks = [task(1, 0), task(2, 2, 1), task(3, 2, 2)]
    const visible = buildVisibleTaskIds(tasks, new Set())
    expect(visible.size).toBe(3)
    const forced = buildForcedOpenTaskIds(tasks, visible, new Set())
    expect(forced.size).toBe(0)
  })
})

describe("buildDimmedTaskIds", () => {
  it("atenúa el ancestro visible que no coincide", () => {
    const tasks = [task(1, 0), task(2, 2, 1)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    const dimmed = buildDimmedTaskIds(tasks, visible, new Set([2]))
    expect(dimmed.has(1)).toBe(true)
    expect(dimmed.has(2)).toBe(false)
  })

  it("no atenúa la tarea que coincide con el filtro", () => {
    const tasks = [task(1, 2), task(2, 0, 1)]
    const visible = buildVisibleTaskIds(tasks, new Set([2]))
    const dimmed = buildDimmedTaskIds(tasks, visible, new Set([2]))
    expect(dimmed.has(1)).toBe(false)
  })

  it("sin filtro devuelve set vacío", () => {
    const tasks = [task(1, 0), task(2, 2, 1)]
    const visible = buildVisibleTaskIds(tasks, new Set())
    const dimmed = buildDimmedTaskIds(tasks, visible, new Set())
    expect(dimmed.size).toBe(0)
  })
})
