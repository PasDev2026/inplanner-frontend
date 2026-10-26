import { useMemo, useState } from "react"
import {
  CornerDownRight,
  Search,
  SearchX,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { cn } from "@/features/shared/lib/utils"
import type {
  ImportPreview,
  ImportPreviewRow,
} from "../actions/import.api"
import { IMPORT_ACTION_META, IMPORT_CHANGE_LABELS } from "../lib/import-labels"
import {
  countPreviewRows,
  filterPreviewRows,
  IMPORT_PREVIEW_PAGE_SIZE,
  paginatePreviewRows,
  type ImportPreviewFilter,
} from "../lib/import-preview"
import ImportActivitiesSummary from "./ImportActivitiesSummary"

const TABS: { key: ImportPreviewFilter; label: string }[] = [
  { key: "changes", label: "Cambios" },
  { key: "create", label: "Nuevas" },
  { key: "update", label: "Actualizar" },
  { key: "omit", label: "Omitir" },
  { key: "all", label: "Todas" },
]

function EstadoBadge({ estado }: { estado: number }) {
  const meta = TASK_STATUS_MAP[estado] ?? TASK_STATUS_MAP[0]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta.style,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotColor)} />
      {meta.label}
    </span>
  )
}

function AccionBadge({ accion }: { accion: ImportPreviewRow["accion"] }) {
  const meta = IMPORT_ACTION_META[accion]
  const Icon = meta.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  )
}

function PreviewRow({ row }: { row: ImportPreviewRow }) {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="px-3 text-xs text-muted-foreground">
        {row.numeroFila}
      </TableCell>
      <TableCell className="px-3 text-xs text-muted-foreground">
        {row.existing_task_id ? `#${row.existing_task_id}` : "—"}
      </TableCell>
      <TableCell className="px-3">
        <div
          className="flex items-start gap-2"
          style={{ paddingLeft: `${Math.max(0, row.nivel - 1) * 18}px` }}
        >
          {row.nivel > 1 && (
            <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-foreground"
              title={row.task_name}
            >
              {row.task_name}
            </p>
            {row.task_description && (
              <p
                className="line-clamp-1 text-[11px] text-muted-foreground"
                title={row.task_description}
              >
                {row.task_description}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-3">
        <AccionBadge accion={row.accion} />
      </TableCell>
      <TableCell className="px-3">
        {row.cambios.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.cambios.map((cambio) => (
              <span
                key={cambio}
                className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {IMPORT_CHANGE_LABELS[cambio]}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="px-3 text-xs text-muted-foreground">
        <p className="line-clamp-2">
          {row.responsables?.join(", ") || "—"}
        </p>
      </TableCell>
      <TableCell className="px-3 text-[11px] text-muted-foreground">
        <div className="space-y-0.5">
          <p>Inicio: {row.start_date || "—"}</p>
          <p>Fin: {row.due_date || "—"}</p>
        </div>
      </TableCell>
      <TableCell className="px-3">
        <EstadoBadge estado={row.estado} />
      </TableCell>
    </TableRow>
  )
}

function EmptyPreview({ hasRows }: { hasRows: boolean }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasRows ? "No hay filas en este filtro" : "No hay filas para mostrar"}
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {hasRows
          ? "Prueba con otro tab o limpia la búsqueda."
          : "El archivo no contiene actividades válidas."}
      </p>
    </div>
  )
}

export default function ImportPreviewPanel({
  preview,
}: {
  preview: ImportPreview
}) {
  const [filter, setFilter] = useState<ImportPreviewFilter>("changes")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const counts = useMemo(
    () => countPreviewRows(preview.filas),
    [preview.filas],
  )
  const filteredRows = useMemo(
    () => filterPreviewRows(preview.filas, filter, search),
    [preview.filas, filter, search],
  )
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / IMPORT_PREVIEW_PAGE_SIZE),
  )
  const currentPage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => paginatePreviewRows(filteredRows, currentPage),
    [filteredRows, currentPage],
  )

  const handleFilterChange = (next: ImportPreviewFilter) => {
    setFilter(next)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <ImportActivitiesSummary preview={preview} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {TABS.map((tab) => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleFilterChange(tab.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar tarea..."
            aria-label="Buscar tarea"
            className="h-8 pr-8 pl-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border">
        {pageRows.length === 0 ? (
          <EmptyPreview hasRows={preview.filas.length > 0} />
        ) : (
          <Table className="min-w-[1050px]">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-16 px-3 text-[11px] tracking-wide uppercase">
                  Fila
                </TableHead>
                <TableHead className="w-20 px-3 text-[11px] tracking-wide uppercase">
                  ID
                </TableHead>
                <TableHead className="px-3 text-[11px] tracking-wide uppercase">
                  Tarea
                </TableHead>
                <TableHead className="w-28 px-3 text-[11px] tracking-wide uppercase">
                  Acción
                </TableHead>
                <TableHead className="w-52 px-3 text-[11px] tracking-wide uppercase">
                  Cambios
                </TableHead>
                <TableHead className="w-40 px-3 text-[11px] tracking-wide uppercase">
                  Responsable
                </TableHead>
                <TableHead className="w-36 px-3 text-[11px] tracking-wide uppercase">
                  Fechas
                </TableHead>
                <TableHead className="w-28 px-3 text-[11px] tracking-wide uppercase">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <PreviewRow
                  key={`${row.numeroFila}-${row.existing_task_id ?? "new"}`}
                  row={row}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {filteredRows.length > 0 && (
        <div className="shrink-0 overflow-hidden rounded-lg border border-border">
          <Pagination
            page={currentPage}
            total={filteredRows.length}
            pageSize={IMPORT_PREVIEW_PAGE_SIZE}
            onPageChange={setPage}
            label="filas"
          />
        </div>
      )}
    </div>
  )
}
