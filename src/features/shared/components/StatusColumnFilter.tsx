import { useState } from "react"
import { ChevronLeft, Check } from "lucide-react"
import { projectStatusTranslation } from "@/features/shared/constants/project-status.constant"
import { statusTranslation } from "@/features/shared/constants/task-status.constant"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type StatusColumnFilterProps = {
    filterType: 'project' | 'task' | null
    filterStatus: string | null
    onChange: (type: 'project' | 'task' | null, status: string | null) => void
}

type Category = 'project' | 'task'

type StatusOption = {
    value: string
    label: string
    dotColor: string
    hoverBg: string
    textColor: string
}

const PROJECT_OPTIONS: StatusOption[] = [
    { value: "0", label: "Planificación", dotColor: "bg-info", hoverBg: "hover:bg-info/10", textColor: "text-info" },
    { value: "1", label: "Activo", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
    { value: "2", label: "En espera", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "3", label: "Completado", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
    { value: "4", label: "Cancelado", dotColor: "bg-muted-foreground", hoverBg: "hover:bg-muted", textColor: "text-muted-foreground" },
]

const TASK_OPTIONS: StatusOption[] = [
    { value: "0", label: "Pendiente", dotColor: "bg-muted-foreground", hoverBg: "hover:bg-muted", textColor: "text-foreground" },
    { value: "1", label: "En espera", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "2", label: "En progreso", dotColor: "bg-info", hoverBg: "hover:bg-info/10", textColor: "text-info" },
    { value: "3", label: "En revisión", dotColor: "bg-warning", hoverBg: "hover:bg-warning/10", textColor: "text-warning" },
    { value: "4", label: "Completado", dotColor: "bg-success", hoverBg: "hover:bg-success/10", textColor: "text-success" },
]

const DOT_MAP: Record<string, string> = {}
for (const opt of [...PROJECT_OPTIONS, ...TASK_OPTIONS]) {
    DOT_MAP[opt.value] = opt.dotColor
}

function getDotColor(value: string): string {
    return DOT_MAP[value] || "bg-muted-foreground"
}

export default function StatusColumnFilter({ filterType, filterStatus, onChange }: StatusColumnFilterProps) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState<Category | null>(null)
    const hasFilter = filterType !== null && filterStatus !== null

    const triggerLabel = hasFilter
        ? `${filterType === 'project' ? 'P' : 'T'}: ${filterType === 'project' ? projectStatusTranslation[filterStatus!] : statusTranslation[filterStatus!]}`
        : "Estado"

    const handleSelectStatus = (value: string) => {
        const actualType = filterType || category
        if (actualType === filterType && value === filterStatus) {
            onChange(null, null)
        } else {
            onChange(actualType, value)
        }
        setOpen(false)
    }

    const handleBack = () => {
        setCategory(null)
    }

    const handleCategorySelect = (cat: Category) => {
        setCategory(cat)
    }

    return (
        <Popover open={open} onOpenChange={(nextOpen) => {
            setOpen(nextOpen)
            if (nextOpen) {
                if (hasFilter) {
                    setCategory(filterType)
                } else {
                    setCategory(null)
                }
            }
        }}>
            <PopoverTrigger
                render={
                    <button className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
                        hasFilter ? 'text-brand-primary' : 'text-muted-foreground'
                    }`}>
                        <span>{triggerLabel}</span>
                        {hasFilter && (
                            <span className={`w-2 h-2 rounded-full ${getDotColor(filterStatus!)}`} />
                        )}
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-48 p-1.5">
                {category === null ? (
                    <div className="space-y-0.5">
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Filtrar por...
                        </div>
                        <div className="border-t border-border pt-0.5 space-y-0.5">
                            <button
                                onClick={() => handleCategorySelect('project')}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                            >
                                Proyecto
                            </button>
                            <button
                                onClick={() => handleCategorySelect('task')}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                            >
                                Tarea
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            {category === 'project' ? 'Proyecto' : 'Tarea'}
                        </button>
                        <div className="border-t border-border pt-0.5 space-y-0.5">
                            {(category === 'project' ? PROJECT_OPTIONS : TASK_OPTIONS).map((opt) => {
                                const isSelected = filterType === category && filterStatus === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSelectStatus(opt.value)}
                                        className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${opt.textColor} ${opt.hoverBg}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                                        {opt.label}
                                        {isSelected && (
                                            <Check className="ml-auto h-3 w-3" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
