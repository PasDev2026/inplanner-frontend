export const statusTranslation: { [key: string]: string } = {
    pending: "Pendiente",
    onHold: "En Espera",
    inProgress: "En Progreso",
    underReview: "En Revisión",
    completed: "Completado",
};

export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

export const priorityTranslation: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
};

export const priorityStyles: Record<string, string> = {
    low: "bg-success/15 text-success border-success/25",
    medium: "bg-warning/15 text-warning border-warning/25",
    high: "bg-destructive/15 text-destructive border-destructive/25",
};

export const taskStatusStyles: Record<string, string> = {
    pending: "bg-muted text-muted-foreground border-border",
    onHold: "bg-destructive/15 text-destructive border-destructive/25",
    inProgress: "bg-info/15 text-info border-info/25",
    underReview: "bg-warning/15 text-warning border-warning/25",
    completed: "bg-success/15 text-success border-success/25",
};

export type StatusColorSet = {
  dot: string
  columnBg: string
  cardBorder: string
  cardBg: string
  overlayBorder: string
}

export const statusColors: Record<string, StatusColorSet> = {
  pending:      { dot: "bg-muted-foreground",     columnBg: "bg-muted/30",   cardBorder: "border-l-muted-foreground",   cardBg: "bg-muted/50",   overlayBorder: "border-l-muted-foreground" },
  onHold:       { dot: "bg-destructive",       columnBg: "bg-destructive/10",    cardBorder: "border-l-destructive",     cardBg: "bg-destructive/15",     overlayBorder: "border-l-destructive" },
  inProgress:   { dot: "bg-info",      columnBg: "bg-info/10",   cardBorder: "border-l-info",    cardBg: "bg-info/15",    overlayBorder: "border-l-info" },
  underReview:  { dot: "bg-warning",     columnBg: "bg-warning/10",  cardBorder: "border-l-warning",   cardBg: "bg-warning/15",  overlayBorder: "border-l-warning" },
  completed:    { dot: "bg-success",   columnBg: "bg-success/10",cardBorder: "border-l-success", cardBg: "bg-success/15",overlayBorder: "border-l-success" },
}

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
    onHold: "bg-destructive/15 text-destructive border-destructive/25",
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

export const TASK_STATUS_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  0: { label: "Pendiente", dotColor: "bg-muted-foreground", style: "bg-muted text-foreground border-border" },
  1: { label: "En espera", dotColor: "bg-destructive", style: "bg-destructive/15 text-destructive border-destructive/25" },
  2: { label: "En progreso", dotColor: "bg-info", style: "bg-info/15 text-info border-info/25" },
  3: { label: "En revisión", dotColor: "bg-warning", style: "bg-warning/15 text-warning border-warning/25" },
  4: { label: "Completado", dotColor: "bg-success", style: "bg-success/15 text-success border-success/25" },
};

export const PRIORITY_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  1: { label: "Baja", dotColor: "bg-success", style: "bg-success/15 text-success border-success/25" },
  2: { label: "Media", dotColor: "bg-warning", style: "bg-warning/15 text-warning border-warning/25" },
  3: { label: "Alta", dotColor: "bg-destructive", style: "bg-destructive/15 text-destructive border-destructive/25" },
  4: { label: "Crítica", dotColor: "bg-destructive", style: "bg-destructive/15 text-destructive border-destructive/25" },
};
