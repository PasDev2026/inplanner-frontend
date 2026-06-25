import { useState } from "react"
import { PRIORITY_MAP } from "@/features/shared/constants/priority.constant"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type PriorityPopoverProps = {
    priority: number | null
    onSelect: (value: number | null) => void
    isPending?: boolean
}

const PRIORITY_KEYS = [1, 2, 3, 4] as const

const PRIORITY_SELECTED_BG: Record<number, string> = {
  1: "bg-success/15",
  2: "bg-warning/15",
  3: "bg-destructive/15",
  4: "bg-destructive/15",
}

export default function PriorityPopover({ priority, onSelect, isPending = false }: PriorityPopoverProps) {
    const [open, setOpen] = useState(false)
    const current = priority != null ? PRIORITY_MAP[priority] : undefined

    const handleSelect = (value: number | null, e?: React.MouseEvent) => {
        e?.stopPropagation()
        onSelect(value)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                disabled={isPending}
                render={
                    <button className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                        ${current ? current.style : "bg-transparent text-muted-foreground border-dashed border-border"}
                        ${isPending ? "opacity-50 pointer-events-none" : ""}
                    `}>
                        {current ? current.label : "—"}
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-40 p-1.5">
                <div className="space-y-0.5">
                    {PRIORITY_KEYS.map((key) => {
                        const opt = PRIORITY_MAP[key]
                        const isSelected = priority === key
                        return (
                            <button
                                key={key}
                                onClick={(e) => handleSelect(key, e)}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors text-foreground ${isSelected ? PRIORITY_SELECTED_BG[key] : 'hover:bg-muted'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                                {opt.label}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
