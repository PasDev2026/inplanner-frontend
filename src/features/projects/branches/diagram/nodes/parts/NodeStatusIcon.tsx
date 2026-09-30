import { PROJECT_STATUS_MAP } from "@/features/shared/constants/project-status.constant"
import { TASK_STATUS_MAP } from "@/features/shared/constants/task-status.constant"
import { cn } from "@/features/shared/lib/utils"

type NodeStatusIconProps = {
  status: number
  kind: "project" | "task"
}

export default function NodeStatusIcon({ status, kind }: NodeStatusIconProps) {
  const map = kind === "project" ? PROJECT_STATUS_MAP : TASK_STATUS_MAP
  const meta = map[status] ?? map[0]

  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dotColor)}
      title={meta.label}
      aria-hidden="true"
    />
  )
}
