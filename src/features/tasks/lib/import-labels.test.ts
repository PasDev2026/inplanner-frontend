import { describe, expect, it } from "vitest"
import {
  formatImportResult,
  IMPORT_ACTION_META,
  IMPORT_CHANGE_LABELS,
} from "./import-labels"

describe("formatImportResult", () => {
  it("usa singular y plural según los conteos", () => {
    expect(
      formatImportResult({ creadas: 1, actualizadas: 0, omitidas: 0 }),
    ).toBe("1 creada")
    expect(
      formatImportResult({ creadas: 0, actualizadas: 1, omitidas: 0 }),
    ).toBe("1 actualizada")
    expect(
      formatImportResult({ creadas: 0, actualizadas: 0, omitidas: 1 }),
    ).toBe("1 omitida")
    expect(
      formatImportResult({ creadas: 2, actualizadas: 1, omitidas: 7 }),
    ).toBe("2 creadas · 1 actualizada · 7 omitidas")
  })

  it("devuelve 'No hubo cambios' cuando todo es cero", () => {
    expect(
      formatImportResult({ creadas: 0, actualizadas: 0, omitidas: 0 }),
    ).toBe("No hubo cambios")
  })
})

describe("etiquetas de importación", () => {
  it("tiene etiqueta para cada campo de cambio", () => {
    expect(IMPORT_CHANGE_LABELS).toEqual({
      name: "Tarea",
      description: "Descripción",
      startDate: "Fecha inicio",
      dueDate: "Fecha vencimiento",
      status: "Estado",
      parent: "Nivel",
      responsibles: "Responsables",
    })
  })

  it("tiene metadatos para cada acción", () => {
    expect(IMPORT_ACTION_META.crear.label).toBe("Nueva")
    expect(IMPORT_ACTION_META.actualizar.label).toBe("Actualizar")
    expect(IMPORT_ACTION_META.omitir.label).toBe("Omitir")
  })
})
