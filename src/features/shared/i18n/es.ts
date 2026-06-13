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
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-amber-100 text-amber-700 border-amber-300",
    high: "bg-red-100 text-red-700 border-red-300",
};

export const taskStatusStyles: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600 border-slate-300",
    onHold: "bg-red-100 text-red-600 border-red-300",
    inProgress: "bg-blue-100 text-blue-600 border-blue-300",
    underReview: "bg-amber-100 text-amber-600 border-amber-300",
    completed: "bg-emerald-100 text-emerald-600 border-emerald-300",
};

export type StatusColorSet = {
  dot: string
  columnBg: string
  cardBorder: string
  cardBg: string
  overlayBorder: string
}

export const statusColors: Record<string, StatusColorSet> = {
  pending:      { dot: "bg-slate-500",     columnBg: "bg-slate-50",   cardBorder: "border-l-slate-500",   cardBg: "bg-slate-100",   overlayBorder: "border-l-slate-500" },
  onHold:       { dot: "bg-red-500",       columnBg: "bg-red-50",    cardBorder: "border-l-red-500",     cardBg: "bg-red-100",     overlayBorder: "border-l-red-500" },
  inProgress:   { dot: "bg-blue-500",      columnBg: "bg-blue-50",   cardBorder: "border-l-blue-500",    cardBg: "bg-blue-100",    overlayBorder: "border-l-blue-500" },
  underReview:  { dot: "bg-amber-500",     columnBg: "bg-amber-50",  cardBorder: "border-l-amber-500",   cardBg: "bg-amber-100",  overlayBorder: "border-l-amber-500" },
  completed:    { dot: "bg-emerald-500",   columnBg: "bg-emerald-50",cardBorder: "border-l-emerald-500", cardBg: "bg-emerald-100",overlayBorder: "border-l-emerald-500" },
}

export const projectStatusTranslation: Record<string, string> = {
    planning: "Planificación",
    active: "Activo",
    onHold: "En Espera",
    completed: "Completado",
    cancelled: "Cancelado",
};

export const projectStatusStyles: Record<string, string> = {
    planning: "bg-purple-100 text-purple-700 border-purple-300",
    active: "bg-blue-100 text-blue-700 border-blue-300",
    onHold: "bg-red-100 text-red-700 border-red-300",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-300",
    cancelled: "bg-gray-100 text-gray-600 border-gray-300",
};

export const PROJECT_STATUS_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  0: { label: "Planificación", dotColor: "bg-purple-500", style: "bg-purple-100 text-purple-700 border-purple-300" },
  1: { label: "Activo", dotColor: "bg-blue-500", style: "bg-blue-100 text-blue-700 border-blue-300" },
  2: { label: "En espera", dotColor: "bg-amber-500", style: "bg-amber-100 text-amber-700 border-amber-300" },
  3: { label: "Completado", dotColor: "bg-emerald-500", style: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  4: { label: "Cancelado", dotColor: "bg-gray-500", style: "bg-gray-100 text-gray-600 border-gray-300" },
};

export const TASK_STATUS_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  0: { label: "Pendiente", dotColor: "bg-slate-500", style: "bg-slate-100 text-slate-700 border-slate-300" },
  1: { label: "En espera", dotColor: "bg-red-500", style: "bg-red-100 text-red-700 border-red-300" },
  2: { label: "En progreso", dotColor: "bg-blue-500", style: "bg-blue-100 text-blue-700 border-blue-300" },
  3: { label: "En revisión", dotColor: "bg-amber-500", style: "bg-amber-100 text-amber-700 border-amber-300" },
  4: { label: "Completado", dotColor: "bg-emerald-500", style: "bg-emerald-100 text-emerald-700 border-emerald-300" },
};

export const PRIORITY_MAP: Record<number, { label: string; dotColor: string; style: string }> = {
  1: { label: "Baja", dotColor: "bg-green-500", style: "bg-green-100 text-green-700 border-green-300" },
  2: { label: "Media", dotColor: "bg-amber-500", style: "bg-amber-100 text-amber-700 border-amber-300" },
  3: { label: "Alta", dotColor: "bg-red-500", style: "bg-red-100 text-red-700 border-red-300" },
  4: { label: "Crítica", dotColor: "bg-purple-500", style: "bg-purple-100 text-purple-700 border-purple-300" },
};
