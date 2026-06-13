import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/features/shared/lib/utils"

type DateRangePickerProps = {
  dateRange: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  dateRange,
  onSelect,
  disabled = false,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            data-empty={!dateRange?.from}
            className={cn(
              "w-full justify-between text-left font-normal",
              "data-[empty=true]:text-muted-foreground",
              className
            )}
          >
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "P", { locale: es })} –{" "}
                  {format(dateRange.to, "P", { locale: es })}
                </>
              ) : (
                format(dateRange.from, "P", { locale: es })
              )
            ) : (
              <span>Seleccionar rango</span>
            )}
            <CalendarIcon className="ml-1 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onSelect}
          defaultMonth={dateRange?.from}
          locale={es}
          numberOfMonths={1}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
