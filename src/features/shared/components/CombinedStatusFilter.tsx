import { useState } from "react"
import { Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PROJECT_OPTIONS, TASK_OPTIONS, type StatusOption } from "@/features/shared/lib/statusOptions"

type CombinedStatusFilterProps = {
    projectSelected: string[]
    onProjectChange: (values: string[]) => void
    taskSelected: string[]
    onTaskChange: (values: string[]) => void
}

function OptionGroup({
    title,
    options,
    selected,
    onChange,
}: {
    title: string
    options: StatusOption[]
    selected: string[]
    onChange: (values: string[]) => void
}) {
    return (
        <div className="pb-1 last:pb-0 last:border-t last:border-border last:pt-1.5">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </p>
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
        </div>
    )
}

export default function CombinedStatusFilter({
    projectSelected,
    onProjectChange,
    taskSelected,
    onTaskChange,
}: CombinedStatusFilterProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors group">
                        <span>Estado</span>
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-56 p-1.5">
                <div className="space-y-1">
                    <OptionGroup
                        title="Proyectos"
                        options={PROJECT_OPTIONS}
                        selected={projectSelected}
                        onChange={onProjectChange}
                    />
                    <OptionGroup
                        title="Tareas"
                        options={TASK_OPTIONS}
                        selected={taskSelected}
                        onChange={onTaskChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
