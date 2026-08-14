export type StatusOption = {
    value: string
    label: string
    dotColor: string
    hoverBg: string
    textColor: string
}

export const PROJECT_OPTIONS: StatusOption[] = [
    { value: "0", label: "Planificación", dotColor: "bg-info", hoverBg: "hover:bg-info/10", textColor: "text-info" },
    { value: "1", label: "Activo", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
    { value: "2", label: "En espera", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "3", label: "Completado", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
    { value: "4", label: "Cancelado", dotColor: "bg-muted-foreground", hoverBg: "hover:bg-muted", textColor: "text-muted-foreground" },
]

export const TASK_OPTIONS: StatusOption[] = [
    { value: "0", label: "Pendiente", dotColor: "bg-muted-foreground", hoverBg: "hover:bg-muted", textColor: "text-muted-foreground" },
    { value: "1", label: "En espera", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "2", label: "En progreso", dotColor: "bg-info", hoverBg: "hover:bg-info/10", textColor: "text-info" },
    { value: "3", label: "En revisión", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "4", label: "Completado", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
]
