import { useState, useEffect, useRef } from "react"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/features/shared/lib/utils"
import { formatDateRange, toDate } from "@/features/shared/lib/format-date"

type DateRangePopoverProps = {
  startDate?: string | null
  dueDate?: string | null
  onSave: (start_date: string | null, due_date: string | null) => void
  isPending?: boolean
  showDueStatus?: boolean
  disabledDays?: { before: Date; after: Date }
  projectRangeLabel?: string
}

export default function DateRangePopover({
  startDate,
  dueDate,
  onSave,
  isPending = false,
  showDueStatus = false,
  disabledDays,
  projectRangeLabel,
}: DateRangePopoverProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: toDate(startDate),
    to: toDate(dueDate),
  })
  const initialRef = useRef({ startDate, dueDate })

  const hasDates = !!startDate || !!dueDate

  const dueStatus = (() => {
    if (!showDueStatus || !dueDate) return null as string | null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dueDate)
    const daysUntilDue = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue < 0) return "overdue"
    if (daysUntilDue <= 1) return "near"
    return "normal"
  })()

  const hasChanged = (): boolean => {
    const init = initialRef.current
    const nowFrom = range.from?.toISOString() ?? null
    const nowTo = range.to?.toISOString() ?? null
    return (
      nowFrom !== (toDate(init.startDate)?.toISOString() ?? null) ||
      nowTo !== (toDate(init.dueDate)?.toISOString() ?? null)
    )
  }

  const handleSave = () => {
    if (!hasChanged()) return
    onSave(
      range.from ? range.from.toISOString() : null,
      range.to ? range.to.toISOString() : null,
    )
  }

  // Sync state when props change (after mutation resolves)
  useEffect(() => {
    initialRef.current = { startDate, dueDate }
    setRange({ from: toDate(startDate), to: toDate(dueDate) })
  }, [startDate, dueDate])

  // Auto-save on range change
  useEffect(() => {
    if (range.from && hasChanged()) {
      handleSave()
    }
  }, [range.from?.getTime(), range.to?.getTime()])

  const triggerClass = cn(
    "text-left text-sm rounded px-1 py-0.5 -ml-1 transition-colors",
    !hasDates && "text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5",
    hasDates && !showDueStatus && "text-slate-700 hover:text-brand-primary hover:bg-brand-primary/5",
    hasDates && showDueStatus && dueStatus === "overdue" && "text-red-600 hover:text-red-700 hover:bg-red-50",
    hasDates && showDueStatus && dueStatus === "near" && "text-amber-600 hover:text-amber-700 hover:bg-amber-50",
    hasDates && showDueStatus && (dueStatus === "normal" || !dueStatus) && "text-slate-700 hover:text-brand-primary hover:bg-brand-primary/5",
    isPending && "opacity-50 pointer-events-none",
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={isPending}
        render={
          <button className={triggerClass}>
            {formatDateRange(startDate, dueDate) || "Añadir fecha"}
          </button>
        }
      />
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          {projectRangeLabel && (
            <p className="text-[10px] text-slate-400 italic">{projectRangeLabel}</p>
          )}
          <Calendar
            mode="range"
            selected={
              range.from || range.to
                ? { from: range.from, to: range.to }
                : undefined
            }
            onSelect={(selected) => {
              if (!selected) {
                setRange({})
                onSave(null, null)
                return
              }
              setRange({ from: selected.from, to: selected.to })
            }}
            locale={es}
            weekStartsOn={1}
            showOutsideDays
            disabled={disabledDays}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
