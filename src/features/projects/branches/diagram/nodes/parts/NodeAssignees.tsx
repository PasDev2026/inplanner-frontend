import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DiagramAssignee } from "@/features/projects/branches/diagram/types"

function initials(assignee: DiagramAssignee): string {
  const name = (assignee.name ?? "").trim().charAt(0)
  const surname = (assignee.apellido_paterno ?? "").trim().charAt(0)
  return `${name}${surname}`.toUpperCase() || "?"
}

function fullName(assignee: DiagramAssignee): string {
  return `${assignee.name ?? ""} ${assignee.apellido_paterno ?? ""}`.trim() || "Sin nombre"
}

export default function NodeAssignees({
  assignees,
}: {
  assignees: DiagramAssignee[]
}) {
  if (assignees.length === 0) return null

  const visible = assignees.slice(0, 3)
  const extra = assignees.length - visible.length

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="nodrag inline-flex items-center" />}>
        <AvatarGroup>
          {visible.map((assignee) => (
            <Avatar key={assignee.user_id} size="sm" className="ring-2 ring-card">
              <AvatarFallback>{initials(assignee)}</AvatarFallback>
            </Avatar>
          ))}
          {extra > 0 && (
            <AvatarGroupCount className="text-[10px]">+{extra}</AvatarGroupCount>
          )}
        </AvatarGroup>
      </TooltipTrigger>
      <TooltipContent>{assignees.map(fullName).join(", ")}</TooltipContent>
    </Tooltip>
  )
}
