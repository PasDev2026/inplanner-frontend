import { AlertTriangle, CheckCircle2, CornerDownRight, Table2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import type { ImportPreview } from "../actions/import.api"

const PREVIEW_LIMITE = 8

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

export default function ImportActivitiesSummary({
  preview,
}: {
  preview: ImportPreview
}) {
  const { validas, ignoradas, errores, filas } = preview
  const hayErrores = errores.length > 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Table2 className="h-3.5 w-3.5" />
          {validas} {validas === 1 ? "tarea" : "tareas"}
        </Badge>
        {ignoradas > 0 && (
          <Badge variant="outline">{ignoradas} ignoradas</Badge>
        )}
        {hayErrores ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {errores.length} {errores.length === 1 ? "error" : "errores"}
          </Badge>
        ) : (
          <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sin errores
          </Badge>
        )}
      </div>

      {hayErrores && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Corrige estas filas e inténtalo de nuevo
          </p>
          <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto text-xs text-destructive">
            {errores.map((error, index) => (
              <li key={`${error.numeroFila}-${index}`}>
                {error.numeroFila > 0 ? `Fila ${error.numeroFila}: ` : ""}
                {error.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {filas.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Vista previa</span>
            <span>
              {Math.min(PREVIEW_LIMITE, filas.length)} de {filas.length}
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 px-3">Fila</TableHead>
                  <TableHead className="px-3">Tarea</TableHead>
                  <TableHead className="w-32 px-3 text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.slice(0, PREVIEW_LIMITE).map((fila) => (
                  <TableRow key={fila.numeroFila}>
                    <TableCell className="px-3 text-xs text-muted-foreground">
                      {fila.numeroFila}
                    </TableCell>
                    <TableCell className="px-3">
                      <div
                        className="flex items-center gap-1.5"
                        style={{ paddingLeft: `${Math.max(0, fila.nivel - 1) * 18}px` }}
                      >
                        {fila.nivel > 1 && (
                          <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium text-foreground">
                          {fila.task_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <EstadoBadge estado={fila.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
