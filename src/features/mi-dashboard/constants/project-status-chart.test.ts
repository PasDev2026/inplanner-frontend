import { describe, expect, it } from "vitest"
import { buildMyProjectStatusData } from "./project-status-chart"
import type { MyProjectItem } from "@/features/mi-dashboard/actions/mi-dashboard.api"

function project(status: number): MyProjectItem {
  return {
    id_project: 1,
    name_project: "Proyecto",
    status,
    privacy_level: 0,
    due_date: "2026-01-01",
  }
}

describe("buildMyProjectStatusData", () => {
  it("agrupa proyectos por estado", () => {
    const data = buildMyProjectStatusData([
      project(0),
      project(0),
      project(1),
      project(3),
      project(4),
    ])

    expect(data).toEqual([
      { name: "Planificación", value: 2, fill: "var(--color-planning)" },
      { name: "Activos", value: 1, fill: "var(--color-active)" },
      { name: "En espera", value: 0, fill: "var(--color-onHold)" },
      { name: "Completados", value: 1, fill: "var(--color-completed)" },
      { name: "Cancelados", value: 1, fill: "var(--color-cancelled)" },
    ])
  })

  it("devuelve ceros con lista vacía", () => {
    const data = buildMyProjectStatusData([])
    expect(data.every((d) => d.value === 0)).toBe(true)
  })
})
