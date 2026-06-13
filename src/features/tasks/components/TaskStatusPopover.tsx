import { useState } from "react"
import { TASK_STATUS_MAP } from "@/features/shared/i18n/es"
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
  0: "bg-slate-500",
  1: "bg-red-500",
  2: "bg-blue-500",
  3: "bg-amber-500",
  4: "bg-emerald-500",
}

const TEXT_COLORS: Record<number, string> = {
  0: "text-slate-700",
  1: "text-red-700",
  2: "text-blue-700",
  3: "text-amber-700",
  4: "text-emerald-700",
}

const HOVER_BG: Record<number, string> = {
  0: "hover:bg-slate-50",
  1: "hover:bg-red-50",
  2: "hover:bg-blue-50",
  3: "hover:bg-amber-50",
  4: "hover:bg-emerald-50",
}

const SELECTED_BG: Record<number, string> = {
  0: "bg-slate-100",
  1: "bg-red-100",
  2: "bg-blue-100",
  3: "bg-amber-100",
  4: "bg-emerald-100",
}

export default function TaskStatusPopover({ status, onSelect, isPending = false }: TaskStatusPopoverProps) {
    const [open, setOpen] = useState(false)
    const info = TASK_STATUS_MAP[status]
    const triggerStyle = info?.style ?? "bg-slate-100 text-slate-600 border-slate-300"

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
