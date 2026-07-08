import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ALL_USERS_KEY } from "@/features/shared/lib/shared-keys"
import { getAllUsers } from "@/features/admin/actions/admin.api"
import { X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ResponsibleColumnFilterProps = {
  responsibleId: number | null
  onChange: (userId: number | null) => void
}

export default function ResponsibleColumnFilter({ responsibleId, onChange }: ResponsibleColumnFilterProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data: users = [] } = useQuery({
    queryKey: ALL_USERS_KEY(1),
    queryFn: async () => {
      const result = await getAllUsers(1, 200)
      return result.users ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const filtered = search
    ? users.filter((u) =>
        `${u.name} ${u.apellido_paterno ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      )
    : users

  const selected = responsibleId ? users.find((u) => u.id_user === responsibleId) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors group ${
              responsibleId ? "text-brand-primary" : "text-muted-foreground"
            }`}
          >
            <span>{selected ? `${selected.name} ${selected.apellido_paterno ?? ""}`.trim() : "Responsable"}</span>
          </button>
        }
      />
      <PopoverContent sideOffset={6} align="start" className="w-56 p-2">
        <div className="space-y-2">
          {responsibleId && (
            <button
              onClick={() => { onChange(null); setOpen(false); setSearch("") }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Todos
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
              const isSelected = responsibleId === user.id_user
              return (
                <div
                  key={user.id_user}
                  onClick={() => {
                    onChange(isSelected ? null : user.id_user)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                    isSelected ? "bg-accent text-brand-dark" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {`${user.name} ${user.apellido_paterno ?? ""}`.trim()}
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
