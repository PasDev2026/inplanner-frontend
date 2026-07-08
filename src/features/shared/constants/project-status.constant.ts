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
