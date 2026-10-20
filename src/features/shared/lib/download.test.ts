import { afterEach, describe, expect, it, vi } from "vitest"
import { downloadBlob, sanitizeFilename } from "./download"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("sanitizeFilename", () => {
  it("quita acentos, espacios y caracteres inválidos", () => {
    expect(sanitizeFilename("Proyecto Ñandú / Fase 1")).toBe(
      "Proyecto_Nandu_Fase_1",
    )
  })

  it("devuelve cadena vacía si no hay valor", () => {
    expect(sanitizeFilename()).toBe("")
    expect(sanitizeFilename(null)).toBe("")
  })

  it("recorta a 80 caracteres", () => {
    expect(sanitizeFilename("a".repeat(120))).toHaveLength(80)
  })
})

describe("downloadBlob", () => {
  it("crea el enlace, dispara la descarga y revoca la URL", () => {
    const createObjectURL = vi.fn(() => "blob:url")
    const revokeObjectURL = vi.fn()
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL })

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})
    const createElement = vi.spyOn(document, "createElement")

    const blob = new Blob(["contenido"])
    downloadBlob(blob, "archivo.xlsx")

    const link = createElement.mock.results[0].value as HTMLAnchorElement
    expect(link.download).toBe("archivo.xlsx")
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:url")
  })
})
