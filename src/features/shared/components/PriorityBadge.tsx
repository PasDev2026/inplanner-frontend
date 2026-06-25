import { PRIORITY_MAP } from "@/features/shared/constants/priority.constant"

type PriorityBadgeProps = {
  priority: number | null
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (priority == null) return null
  const info = PRIORITY_MAP[priority]
  if (!info) return null
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.style}`}>
      {info.label}
    </span>
  )
}
