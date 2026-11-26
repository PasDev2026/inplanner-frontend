import { useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/features/shared/lib/utils'
import type { AvailableUser } from '@/features/shared/actions/users.api'

type SearchableUserSelectProps = {
  users: AvailableUser[]
  value: string | null
  onChange: (userId: string | null) => void
  placeholder?: string
  allowNone?: boolean
  noneLabel?: string
  disabled?: boolean
  className?: string
}

function displayName(user: AvailableUser): string {
  return [user.name, user.apellido_paterno, user.apellido_materno]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export default function SearchableUserSelect({
  users,
  value,
  onChange,
  placeholder = 'Seleccionar usuario',
  allowNone = false,
  noneLabel = 'Sin asignar',
  disabled = false,
  className,
}: SearchableUserSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedUser = users.find((user) => user.id_user === value)
  const normalizedSearch = search.trim().toLowerCase()
  const filtered = normalizedSearch
    ? users.filter((user) =>
        displayName(user).toLowerCase().includes(normalizedSearch),
      )
    : users

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSearch('')
  }

  const select = (userId: string | null) => {
    onChange(userId)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-sm outline-none transition-colors',
              'hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
          >
            <span
              className={cn(
                'min-w-0 truncate text-left',
                !selectedUser && 'text-muted-foreground',
              )}
            >
              {selectedUser ? displayName(selectedUser) : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        }
      />

      <PopoverContent
        sideOffset={6}
        align="start"
        className="w-[var(--anchor-width)] min-w-64 p-2"
      >
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario..."
              className="w-full rounded-md border border-border bg-card py-1.5 pr-2.5 pl-8 text-xs text-foreground outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              autoFocus
            />
          </div>

          {allowNone && (
            <>
              <button
                type="button"
                onClick={() => select(null)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors',
                  !value
                    ? 'bg-accent text-brand-dark'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <X className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{noneLabel}</span>
                {!value && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
              <div className="h-px bg-border" />
            </>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filtered.map((user) => {
              const isSelected = user.id_user === value
              return (
                <button
                  key={user.id_user}
                  type="button"
                  onClick={() => select(user.id_user)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-accent text-brand-dark'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {displayName(user)}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )
            })}

            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No se encontraron usuarios
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
