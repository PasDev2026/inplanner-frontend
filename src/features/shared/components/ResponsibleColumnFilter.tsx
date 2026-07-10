import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AVAILABLE_USERS_KEY } from "@/features/shared/lib/shared-keys"
import { getAvailableUsers } from "@/features/shared/actions/users.api"
import { X, Check } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ResponsibleColumnFilterProps = {
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function ResponsibleColumnFilter({ selected, onChange }: ResponsibleColumnFilterProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

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

  const selectedUsers = users.filter(u => selected.includes(u.id_user))

  const triggerLabel = selectedUsers.length
    ? selectedUsers.map(u => `${u.name} ${u.apellido_paterno ?? ""}`.trim()).join(", ")
    : "Responsable"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
              selected.length ? "text-brand-primary" : "text-muted-foreground"
            }`}
          >
            <span className="max-w-[120px] truncate">{triggerLabel}</span>
          </button>
        }
      />
      <PopoverContent sideOffset={6} align="start" className="w-56 p-2">
        <div className="space-y-2">
          {selected.length > 0 && (
            <button
              onClick={() => { onChange([]); setSearch("") }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full rounded-md border border-border bg-card text-foreground px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filtered.map((user) => {
              const isSelected = selected.includes(user.id_user)
              return (
                <div
                  key={user.id_user}
                  onClick={() => {
                    onChange(
                      isSelected
                        ? selected.filter(id => id !== user.id_user)
                        : [...selected, user.id_user]
                    )
                    setSearch("")
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                    isSelected ? "bg-accent text-brand-dark" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="flex-1">{`${user.name} ${user.apellido_paterno ?? ""}`.trim()}</span>
                  {isSelected && (
                    <Check className="h-3 w-3 shrink-0" />
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
