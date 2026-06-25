import { useState } from "react"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type TaskStatusPopoverProps = {
    status: number
    onSelect: (value: number) => void
    isPending?: boolean
}

const OPTIONS = [0, 1, 2, 3, 4] as const

const DOT_COLORS: Record<number, string> = {
  0: "bg-muted-foreground",
  1: "bg-warning",
  2: "bg-info",
  3: "bg-success",
  4: "bg-success",
}

const TEXT_COLORS: Record<number, string> = {
  0: "text-foreground",
  1: "text-warning",
  2: "text-info",
  3: "text-success",
  4: "text-success",
}

const HOVER_BG: Record<number, string> = {
  0: "hover:bg-muted",
  1: "hover:bg-warning/10",
  2: "hover:bg-info/10",
  3: "hover:bg-success/10",
  4: "hover:bg-success/10",
}

const SELECTED_BG: Record<number, string> = {
  0: "bg-muted",
  1: "bg-warning/15",
  2: "bg-info/15",
  3: "bg-success/15",
  4: "bg-success/15",
}

export default function TaskStatusPopover({ status, onSelect, isPending = false }: TaskStatusPopoverProps) {
    const [open, setOpen] = useState(false)
    const info = TASK_STATUS_MAP[status]
    const triggerStyle = info?.style ?? "bg-muted text-muted-foreground border-border"

    const handleSelect = (value: number, e?: React.MouseEvent) => {
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
                        ${triggerStyle}
                        ${isPending ? "opacity-50 pointer-events-none" : ""}
                    `}>
                        {info?.label ?? "Desconocido"}
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-44 p-1.5">
                <div className="space-y-0.5">
                    {OPTIONS.map((opt) => {
                        const optInfo = TASK_STATUS_MAP[opt]
                        const isSelected = status === opt
                        return (
                            <button
                                key={opt}
                                onClick={(e) => handleSelect(opt, e)}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${TEXT_COLORS[opt]} ${isSelected ? SELECTED_BG[opt] : HOVER_BG[opt]}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${DOT_COLORS[opt]}`} />
                                {optInfo?.label ?? opt}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
