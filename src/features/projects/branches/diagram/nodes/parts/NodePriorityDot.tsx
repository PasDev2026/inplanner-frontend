import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PRIORITY_MAP } from "@/features/shared/constants/priority.constant"
import { cn } from "@/features/shared/lib/utils"

export default function NodePriorityDot({
  priority,
}: {
  priority: number | null
}) {
  const meta = priority != null ? PRIORITY_MAP[priority] : undefined
  if (!meta) return null

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="nodrag inline-flex items-center" />}>
        <span
          className={cn("h-2 w-2 shrink-0 rounded-full", meta.dotColor)}
          aria-hidden="true"
        />
      </TooltipTrigger>
      <TooltipContent>Prioridad {meta.label}</TooltipContent>
    </Tooltip>
  )
}
