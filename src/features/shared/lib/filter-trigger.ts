import { cn } from "./utils"

export type FilterAppearance = "header" | "chip"

/** Clases del trigger para los filtros de columna (cabecera de tabla o chip). */
export function filterTriggerClass(
  appearance: FilterAppearance,
  active: boolean,
): string {
  if (appearance === "chip") {
    return cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium select-none cursor-pointer transition-colors",
      active
        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
        : "border-border bg-card text-foreground hover:border-brand-primary/60 hover:text-brand-primary",
    )
  }
  return cn(
    "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider select-none cursor-pointer transition-colors hover:text-foreground group",
    active ? "text-brand-primary" : "text-muted-foreground",
  )
}
