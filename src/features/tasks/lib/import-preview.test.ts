import { describe, expect, it } from "vitest"
import type { ImportPreviewRow } from "../actions/import.api"
import {
  countPreviewRows,
  filterPreviewRows,
  normalizeImportSearch,
  paginatePreviewRows,
} from "./import-preview"

function row(
  overrides: Partial<ImportPreviewRow> & {
    numeroFila: number
    accion: ImportPreviewRow["accion"]
    task_name: string
  },
): ImportPreviewRow {
  return {
    nivel: 1,
    estado: 0,
    cambios: [],
    ...overrides,
  }
}

const ROWS: ImportPreviewRow[] = [
  row({ numeroFila: 2, accion: "crear", task_name: "Planificación del día" }),
  row({ numeroFila: 3, accion: "actualizar", task_name: "Revisar correos" }),
  row({ numeroFila: 4, accion: "omitir", task_name: "Reunión de equipo" }),
  row({ numeroFila: 5, accion: "crear", task_name: "Documentación" }),
]

describe("normalizeImportSearch", () => {
  it("quita acentos, mayúsculas y espacios extra", () => {
    expect(normalizeImportSearch("  PLANIFICACIÓN   del día ")).toBe(
      "planificacion del dia",
    )
  })
})

describe("countPreviewRows", () => {
  it("cuenta nuevas, actualizadas, omitidas y el total", () => {
    expect(countPreviewRows(ROWS)).toEqual({
      changes: 3,
      create: 2,
      update: 1,
      omit: 1,
      all: 4,
    })
  })

  it("devuelve todo en cero para una lista vacía", () => {
    expect(countPreviewRows([])).toEqual({
      changes: 0,
      create: 0,
      update: 0,
      omit: 0,
      all: 0,
    })
  })
})

describe("filterPreviewRows", () => {
  it("agrupa nuevas y actualizadas en 'changes'", () => {
    expect(filterPreviewRows(ROWS, "changes", "").map((r) => r.accion)).toEqual([
      "crear",
      "actualizar",
      "crear",
    ])
  })

  it("filtra por cada acción", () => {
    expect(filterPreviewRows(ROWS, "create", "")).toHaveLength(2)
    expect(filterPreviewRows(ROWS, "update", "")).toHaveLength(1)
    expect(filterPreviewRows(ROWS, "omit", "")).toHaveLength(1)
    expect(filterPreviewRows(ROWS, "all", "")).toHaveLength(4)
  })

  it("busca por nombre sin acentos ni mayúsculas", () => {
    expect(
      filterPreviewRows(ROWS, "all", "planificacion").map((r) => r.numeroFila),
    ).toEqual([2])
    expect(
      filterPreviewRows(ROWS, "all", "REUNION").map((r) => r.numeroFila),
    ).toEqual([4])
  })

  it("devuelve vacío si no hay coincidencias", () => {
    expect(filterPreviewRows(ROWS, "all", "no existe")).toEqual([])
  })
})

describe("paginatePreviewRows", () => {
  const manyRows = Array.from({ length: 120 }, (_, index) =>
    row({
      numeroFila: index + 2,
      accion: "omitir",
      task_name: `Tarea ${index + 1}`,
    }),
  )

  it("devuelve 50 filas en la primera página", () => {
    expect(paginatePreviewRows(manyRows, 1)).toHaveLength(50)
  })

  it("devuelve las filas restantes en la última página", () => {
    const lastPage = paginatePreviewRows(manyRows, 3)
    expect(lastPage).toHaveLength(20)
    expect(lastPage[0].numeroFila).toBe(102)
  })

  it("devuelve vacío fuera de rango", () => {
    expect(paginatePreviewRows(manyRows, 4)).toEqual([])
  })
})
