import { useState } from "react"
import { Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type StatusColumnFilterProps = {
    selected: string[]
    onChange: (values: string[]) => void
}

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

export default function StatusColumnFilter({ selected, onChange }: StatusColumnFilterProps) {
    const [open, setOpen] = useState(false)

    const triggerLabel = selected.length
        ? selected.map(v => PROJECT_OPTIONS.find(o => o.value === v)?.label ?? v).join(", ")
        : "Estado"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
                        selected.length ? 'text-brand-primary' : 'text-muted-foreground'
                    }`}>
                        <span className="max-w-[120px] truncate">{triggerLabel}</span>
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-48 p-1.5">
                <div className="space-y-0.5">
                    {PROJECT_OPTIONS.map((opt) => {
                        const isSelected = selected.includes(opt.value)
                        return (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(isSelected
                                        ? selected.filter(v => v !== opt.value)
                                        : [...selected, opt.value]
                                    )
                                }}
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
            </PopoverContent>
        </Popover>
    )
}
