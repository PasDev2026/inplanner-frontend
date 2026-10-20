import { MinusCircle, Pencil, PlusCircle, type LucideIcon } from "lucide-react"
import type {
  ImportAction,
  ImportChange,
  ImportResult,
} from "../actions/import.api"

export const IMPORT_CHANGE_LABELS: Record<ImportChange, string> = {
  name: "Tarea",
  description: "Descripción",
  startDate: "Fecha inicio",
  dueDate: "Fecha vencimiento",
  status: "Estado",
  parent: "Nivel",
  responsibles: "Responsables",
}

export const IMPORT_ACTION_META: Record<
  ImportAction,
  { label: string; icon: LucideIcon; className: string }
> = {
  crear: {
    label: "Nueva",
    icon: PlusCircle,
    className:
      "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  actualizar: {
    label: "Actualizar",
    icon: Pencil,
    className:
      "border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  omitir: {
    label: "Omitir",
    icon: MinusCircle,
    className: "border-border bg-muted text-muted-foreground",
  },
}

export function formatImportResult(
  result: Pick<ImportResult, "creadas" | "actualizadas" | "omitidas">,
): string {
  const parts: string[] = []

  if (result.creadas > 0) {
    parts.push(
      `${result.creadas} ${result.creadas === 1 ? "creada" : "creadas"}`,
    )
  }
  if (result.actualizadas > 0) {
    parts.push(
      `${result.actualizadas} ${
        result.actualizadas === 1 ? "actualizada" : "actualizadas"
      }`,
    )
  }
  if (result.omitidas > 0) {
    parts.push(
      `${result.omitidas} ${result.omitidas === 1 ? "omitida" : "omitidas"}`,
    )
  }

  return parts.length > 0 ? parts.join(" · ") : "No hubo cambios"
}
