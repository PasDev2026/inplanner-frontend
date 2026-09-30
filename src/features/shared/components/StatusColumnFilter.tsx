import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  filterTriggerClass,
  type FilterAppearance,
} from "@/features/shared/lib/filter-trigger"
import { PROJECT_OPTIONS, TASK_OPTIONS } from "@/features/shared/lib/statusOptions"

type StatusColumnFilterProps = {
    selected: string[]
    onChange: (values: string[]) => void
    variant?: "project" | "task"
    appearance?: FilterAppearance
}

export default function StatusColumnFilter({
    selected,
    onChange,
    variant = "project",
    appearance = "header",
}: StatusColumnFilterProps) {
    const [open, setOpen] = useState(false)

    const options = variant === "task" ? TASK_OPTIONS : PROJECT_OPTIONS

    const triggerLabel = selected.length
        ? selected.map(v => options.find(o => o.value === v)?.label ?? v).join(", ")
        : "Estado"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button className={filterTriggerClass(appearance, selected.length > 0)}>
                        <span className="max-w-[120px] truncate">{triggerLabel}</span>
                        {appearance === "chip" && (
                            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        )}
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-48 p-1.5">
                <div className="space-y-0.5">
                    {options.map((opt) => {
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
