import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ALL_USERS_KEY } from "@/features/shared/lib/shared-keys"
import { PROJECT_SEDE_USERS_KEY } from "@/features/projects/lib/project-keys"
import { getAllUsers } from "@/features/admin/actions/admin.api"
import { User, Check } from "lucide-react"
import type { UserAdmin } from "@/features/admin/schemas/user.schema"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ResponsiblePopoverProps = {
  projectId: number
  assignedTo: { user_id: number }[]
  onAssign: (userIds: number[]) => void
  isPending?: boolean
}

function getInitial(name: string): string {
  if (!name) return ""
  return name.charAt(0)
}

export default function ResponsiblePopover({ projectId, assignedTo, onAssign, isPending = false }: ResponsiblePopoverProps) {
  const [open, setOpen] = useState(false)
  const [page] = useState(1)
  const queryClient = useQueryClient()

  const { data: users = [] } = useQuery({
    queryKey: ALL_USERS_KEY(page),
    queryFn: async () => {
      const result = await getAllUsers(page, 50)
      return (result.users as UserAdmin[]) ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const selectedIds = new Set(assignedTo.map((u) => u.user_id))

  const toggleUser = (userId: number) => {
    const next = new Set(selectedIds)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    onAssign(Array.from(next))
  }

  const triggerLabel = () => {
    if (assignedTo.length === 0) return "No asignado"
    const first = users.find((u) => u.id_user === assignedTo[0].user_id)
    if (!first) return `${assignedTo.length} asignado(s)`
    const firstName = first.name.split(" ")[0]
    const rest = assignedTo.length - 1
    return rest > 0 ? `${firstName} +${rest}` : firstName
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={isPending}
        render={
          <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors
            ${assignedTo.length > 0
              ? "bg-muted text-brand-dark border-border"
              : "bg-muted text-muted-foreground border-border"
            }
            ${isPending ? "opacity-50 pointer-events-none" : ""}
          `}>
            <User className="h-3 w-3" />
            {triggerLabel()}
          </button>
        }
      />

      <PopoverContent sideOffset={6} align="start" className="w-64 p-3">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pb-2">
            Responsable
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {users.map((user) => {
              const isSelected = selectedIds.has(user.id_user)
              const initial = getInitial(user.apellido_paterno ?? "")
              return (
                <div
                  key={user.id_user}
                  onClick={() => {
                    toggleUser(user.id_user)
                    queryClient.invalidateQueries({ queryKey: PROJECT_SEDE_USERS_KEY(projectId) })
                  }}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors 
                    ${isSelected ? "bg-accent" : "hover:bg-accent"}`}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className={`text-xs font-medium truncate ${isSelected ? "text-brand-dark" : "text-foreground"}`}>
                      {user.name}{initial ? ` ${initial}.` : ""}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-brand-dark shrink-0" />
                  )}
                </div>
              )
            })}
            {users.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No se encontraron usuarios</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
