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

export const PRIORITY_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  1: { label: "Baja", dotColor: "bg-success", style: "bg-success/15 text-success border-success/25" },
  2: { label: "Media", dotColor: "bg-warning", style: "bg-warning/15 text-warning border-warning/25" },
  3: { label: "Alta", dotColor: "bg-destructive", style: "bg-destructive/15 text-destructive border-destructive/25" },
  4: { label: "Crítica", dotColor: "bg-destructive", style: "bg-destructive/15 text-destructive border-destructive/25" },
};
