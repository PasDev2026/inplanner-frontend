import type { ImportPreviewRow } from "../actions/import.api"

export type ImportPreviewFilter =
  | "changes"
  | "create"
  | "update"
  | "omit"
  | "all"

export const IMPORT_PREVIEW_PAGE_SIZE = 50

/** Normaliza texto para búsquedas: sin acentos, minúsculas y sin espacios extra. */
export function normalizeImportSearch(value: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export function filterPreviewRows(
  rows: ImportPreviewRow[],
  filter: ImportPreviewFilter,
  search: string,
): ImportPreviewRow[] {
  const query = normalizeImportSearch(search)

  return rows.filter((row) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "changes" &&
        (row.accion === "crear" || row.accion === "actualizar")) ||
      (filter === "create" && row.accion === "crear") ||
      (filter === "update" && row.accion === "actualizar") ||
      (filter === "omit" && row.accion === "omitir")

    if (!matchesFilter) return false
    if (!query) return true

    return normalizeImportSearch(row.task_name).includes(query)
  })
}

export function countPreviewRows(rows: ImportPreviewRow[]): {
  changes: number
  create: number
  update: number
  omit: number
  all: number
} {
  const counts = {
    changes: 0,
    create: 0,
    update: 0,
    omit: 0,
    all: rows.length,
  }

  for (const row of rows) {
    if (row.accion === "crear") {
      counts.create++
      counts.changes++
    } else if (row.accion === "actualizar") {
      counts.update++
      counts.changes++
    } else {
      counts.omit++
    }
  }

  return counts
}

export function paginatePreviewRows(
  rows: ImportPreviewRow[],
  page: number,
  pageSize = IMPORT_PREVIEW_PAGE_SIZE,
): ImportPreviewRow[] {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
