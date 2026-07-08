import { useState } from "react"
import { PRIORITY_MAP } from "@/features/shared/constants/priority.constant"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const PRIORITY_KEYS = [1, 2, 3, 4] as const

const PRIORITY_SELECTED_BG: Record<number, string> = {
  1: "bg-success/15",
  2: "bg-warning/15",
  3: "bg-destructive/15",
  4: "bg-destructive/15",
}

type PriorityColumnFilterProps = {
  priorityId: number | null
  onChange: (value: number | null) => void
}

export default function PriorityColumnFilter({ priorityId, onChange }: PriorityColumnFilterProps) {
  const [open, setOpen] = useState(false)

  const current = priorityId != null ? PRIORITY_MAP[priorityId] : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
              priorityId ? "text-brand-primary" : "text-muted-foreground"
            }`}
          >
            <span>{current ? current.label : "Prioridad"}</span>
          </button>
        }
      />
      <PopoverContent sideOffset={6} align="start" className="w-40 p-1.5">
        <div className="space-y-0.5">
          {PRIORITY_KEYS.map((key) => {
            const opt = PRIORITY_MAP[key]
            const isSelected = priorityId === key
            return (
              <button
                key={key}
                onClick={() => {
                  onChange(isSelected ? null : key)
                  setOpen(false)
                }}
                className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors text-foreground ${
                  isSelected ? PRIORITY_SELECTED_BG[key] : "hover:bg-muted"
                }`}
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
