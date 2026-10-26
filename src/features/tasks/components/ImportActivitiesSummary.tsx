import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  MinusCircle,
  Pencil,
  PlusCircle,
  Table2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/features/shared/lib/utils"
import type { ImportPreview } from "../actions/import.api"

function SummaryDetail({
  tone,
  title,
  count,
  items,
  defaultOpen,
}: {
  tone: "error" | "warning"
  title: string
  count: number
  items: { numeroFila: number; mensaje: string }[]
  defaultOpen?: boolean
}) {
  const isError = tone === "error"
  const Icon = isError ? AlertTriangle : Info

  return (
    <details
      open={defaultOpen}
      className={cn(
        "group rounded-lg border",
        isError
          ? "border-destructive/40 bg-destructive/5"
          : "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden",
          isError ? "text-destructive" : "text-amber-700 dark:text-amber-400",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {title} ({count})
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <ul
        className={cn(
          "max-h-32 space-y-1 overflow-y-auto border-t px-3 py-2 text-xs",
          isError
            ? "border-destructive/20 text-destructive"
            : "border-amber-500/20 text-amber-800 dark:text-amber-300",
        )}
      >
        {items.map((item, index) => (
          <li key={`${item.numeroFila}-${index}`}>
            {item.numeroFila > 0 ? `Fila ${item.numeroFila}: ` : ""}
            {item.mensaje}
          </li>
        ))}
      </ul>
    </details>
  )
}

export default function ImportActivitiesSummary({
  preview,
}: {
  preview: ImportPreview
}) {
  const {
    validas,
    creadas,
    actualizadas,
    omitidas,
    ignoradas,
    errores,
    avisos,
  } = preview
  const hayErrores = errores.length > 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Table2 className="h-3.5 w-3.5" />
          {validas} {validas === 1 ? "fila" : "filas"}
        </Badge>
        {creadas > 0 && (
          <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
            <PlusCircle className="h-3.5 w-3.5" />
            {creadas} {creadas === 1 ? "nueva" : "nuevas"}
          </Badge>
        )}
        {actualizadas > 0 && (
          <Badge className="gap-1 bg-blue-600 text-white hover:bg-blue-600">
            <Pencil className="h-3.5 w-3.5" />
            {actualizadas} {actualizadas === 1 ? "actualizada" : "actualizadas"}
          </Badge>
        )}
        {omitidas > 0 && (
          <Badge variant="outline" className="gap-1">
            <MinusCircle className="h-3.5 w-3.5" />
            {omitidas} {omitidas === 1 ? "omitida" : "omitidas"}
          </Badge>
        )}
        {ignoradas > 0 && (
          <Badge variant="outline">{ignoradas} ignoradas</Badge>
        )}
        {avisos.length > 0 && (
          <Badge className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400">
            <Info className="h-3.5 w-3.5" />
            {avisos.length} {avisos.length === 1 ? "aviso" : "avisos"}
          </Badge>
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
        <SummaryDetail
          tone="error"
          title="Errores"
          count={errores.length}
          items={errores}
          defaultOpen
        />
      )}

      {avisos.length > 0 && (
        <SummaryDetail
          tone="warning"
          title="Avisos"
          count={avisos.length}
          items={avisos}
        />
      )}
    </div>
  )
}
