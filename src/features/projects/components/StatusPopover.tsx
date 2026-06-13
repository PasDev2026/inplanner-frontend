import { useState } from "react"
import { PROJECT_STATUS_MAP } from "@/features/shared/i18n/es"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type StatusPopoverProps = {
    status: number | null
    onSelect: (value: number) => void
    isPending?: boolean
}

const STATUS_KEYS = [0, 1, 2, 3, 4] as const

const SELECTED_BG: Record<number, string> = {
  0: "bg-purple-100",
  1: "bg-blue-100",
  2: "bg-amber-100",
  3: "bg-emerald-100",
  4: "bg-gray-100",
}

export default function StatusPopover({ status, onSelect, isPending = false }: StatusPopoverProps) {
    const [open, setOpen] = useState(false)
    const current = status != null ? PROJECT_STATUS_MAP[status] : undefined

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
                        ${current ? current.style : "bg-slate-100 text-slate-500 border-slate-200"}
                        ${isPending ? "opacity-50 pointer-events-none" : ""}
                    `}>
                        {current ? current.label : "—"}
                    </button>
                }
            />
            <PopoverContent sideOffset={6} align="start" className="w-44 p-1.5">
                <div className="space-y-0.5">
                    {STATUS_KEYS.map((key) => {
                        const opt = PROJECT_STATUS_MAP[key]
                        const isSelected = status === key
                        return (
                            <button
                                key={key}
                                onClick={(e) => handleSelect(key, e)}
                                className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors text-slate-700 ${isSelected ? SELECTED_BG[key] : 'hover:bg-slate-50'}`}
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
