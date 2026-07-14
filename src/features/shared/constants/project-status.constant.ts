export const projectStatusTranslation: Record<string, string> = {
    planning: "Planificación",
    active: "Activo",
    onHold: "En Espera",
    completed: "Completado",
    cancelled: "Cancelado",
};

export const projectStatusStyles: Record<string, string> = {
    planning: "bg-info/15 text-info border-info/25",
    active: "bg-info/15 text-info border-info/25",
    onHold: "bg-warning/15 text-warning border-warning/25",
    completed: "bg-success/15 text-success border-success/25",
    cancelled: "bg-muted text-muted-foreground border-border",
};

export const PROJECT_STATUS_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  0: { label: "Planificación", dotColor: "bg-info", style: "bg-info/15 text-info border-info/25" },
  1: { label: "Activo", dotColor: "bg-success", style: "bg-success/15 text-success border-success/25" },
  2: { label: "En espera", dotColor: "bg-warning", style: "bg-warning/15 text-warning border-warning/25" },
  3: { label: "Completado", dotColor: "bg-success", style: "bg-success/15 text-success border-success/25" },
  4: { label: "Cancelado", dotColor: "bg-muted-foreground", style: "bg-muted text-muted-foreground border-border" },
};

export const PROJECT_STATUS_NAMES = ["planning", "active", "onHold", "completed", "cancelled"] as const;

export type ProjectStatusColorSet = {
  dot: string
  columnBg: string
  cardBorder: string
  cardBg: string
  overlayBorder: string
}

export const projectStatusColors: Record<string, ProjectStatusColorSet> = {
  planning:   { dot: "bg-info",             columnBg: "bg-info/10",    cardBorder: "border-l-info",             cardBg: "bg-info/15",    overlayBorder: "border-l-info" },
  active:     { dot: "bg-success",          columnBg: "bg-success/10", cardBorder: "border-l-success",          cardBg: "bg-success/15", overlayBorder: "border-l-success" },
  onHold:     { dot: "bg-warning",          columnBg: "bg-warning/10", cardBorder: "border-l-warning",          cardBg: "bg-warning/15", overlayBorder: "border-l-warning" },
  completed:  { dot: "bg-success",          columnBg: "bg-success/10", cardBorder: "border-l-success",          cardBg: "bg-success/15", overlayBorder: "border-l-success" },
  cancelled:  { dot: "bg-muted-foreground", columnBg: "bg-muted/30",   cardBorder: "border-l-muted-foreground", cardBg: "bg-muted/50",   overlayBorder: "border-l-muted-foreground" },
};
