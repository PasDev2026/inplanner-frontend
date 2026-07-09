import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AVAILABLE_USERS_KEY } from "@/features/shared/lib/shared-keys"
import { PROJECT_SEDE_USERS_KEY } from "@/features/projects/lib/project-keys"
import { getAvailableUsers } from "@/features/shared/actions/users.api"
import { User, Check } from "lucide-react"
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
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: users = [] } = useQuery({
    queryKey: AVAILABLE_USERS_KEY,
    queryFn: getAvailableUsers,
    staleTime: 5 * 60 * 1000,
  })

  const filtered = search
    ? users.filter((u) =>
        `${u.name} ${u.apellido_paterno ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      )
    : users

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
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch("") }}>
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

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full rounded-md border border-border bg-card text-foreground px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            ref={(el) => el?.focus({ preventScroll: true })}
          />

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filtered.map((user) => {
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
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No se encontraron usuarios</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
