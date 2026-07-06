import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { cn } from "@/features/shared/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 relative",
        month_caption: "flex justify-start items-center h-8 w-full pl-3 pr-16",
        caption_label: "text-sm font-medium",
        nav: "absolute top-4 right-3 flex items-center gap-1 pointer-events-none h-8",
        button_previous:
          "inline-flex items-center justify-center h-7 w-7 p-0 opacity-50 hover:opacity-100 cursor-pointer pointer-events-auto z-20",
        button_next:
          "inline-flex items-center justify-center h-7 w-7 p-0 opacity-50 hover:opacity-100 cursor-pointer pointer-events-auto z-20",
        month_grid: "w-full",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-9 text-center font-normal text-[0.8rem]",
        week: "flex mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button:
          "inline-flex items-center justify-center h-9 w-9 p-0 font-normal rounded-xl hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
        range_start: "bg-primary text-primary-foreground rounded-xl",
        range_end: "bg-primary text-primary-foreground rounded-xl",
        selected:
          "bg-primary text-primary-foreground rounded-xl",
        today: "font-semibold",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
