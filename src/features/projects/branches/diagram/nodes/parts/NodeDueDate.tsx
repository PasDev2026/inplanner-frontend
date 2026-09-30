import { Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/features/shared/lib/format-date"
import { cn } from "@/features/shared/lib/utils"

export default function NodeDueDate({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null

  const date = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue = date.getTime() < today.getTime()

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="nodrag inline-flex items-center" />}>
        <Calendar
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            overdue ? "text-destructive" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
      </TooltipTrigger>
      <TooltipContent>
        {overdue ? "Vencida: " : "Vence: "}
        {formatDate(dueDate)}
      </TooltipContent>
    </Tooltip>
  )
}
