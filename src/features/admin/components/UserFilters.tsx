import { useState, useEffect, useRef } from "react"
import { Search, X, ChevronDown, FilterX } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { UserListFilters } from "@/features/admin/hooks/useUserListFilters"

interface UserFiltersProps {
  filters: UserListFilters
  onFiltersChange: (f: UserListFilters) => void
  areas: CentralizadoItem[]
  roles: CentralizadoItem[]
  sedes: CentralizadoItem[]
  onClearAll: () => void
}

type ChangeKey = keyof Pick<UserListFilters, 'area_id' | 'rol_id' | 'sede_id'>

export function UserFilters({
  filters,
  onFiltersChange,
  areas, roles, sedes,
  onClearAll,
}: UserFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch })
      }
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])

  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  const [openFilter, setOpenFilter] = useState<ChangeKey | null>(null)
  const [openEstado, setOpenEstado] = useState(false)

  const multiSelect = (key: ChangeKey, items: CentralizadoItem[], labelAll: string) => {
    const selected = filters[key] ? filters[key].split(",").filter(Boolean).map(Number) : []
    const selectedLabels = selected.map(id => items?.find(i => i.id === id)?.nombre).filter(Boolean)
    const triggerLabel = selectedLabels.length ? selectedLabels.join(", ") : labelAll

    return (
      <Popover open={openFilter === key} onOpenChange={(open) => setOpenFilter(open ? key : null)}>
        <PopoverTrigger
          render={
            <button className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card rounded-lg border inline-flex items-center gap-1 min-w-[130px] max-w-[200px]">
              <span className="truncate">{triggerLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          }
        />
        <PopoverContent align="start" className="w-52 p-0">
          <Command>
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => { onFiltersChange({ ...filters, [key]: "" }); setOpenFilter(null) }}
                  className={!selected.length ? "bg-accent" : undefined}
                >
                  {labelAll}
                </CommandItem>
                {items?.map((item) => {
                  const isSelected = selected.includes(item.id)
                  return (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => {
                        const next = isSelected
                          ? selected.filter(id => id !== item.id)
                          : [...selected, item.id]
                        onFiltersChange({ ...filters, [key]: next.join(",") })
                      }}
                      className={isSelected ? "bg-accent" : undefined}
                    >
                      {item.nombre}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-card shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(""); onFiltersChange({ ...filters, search: "" }) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {multiSelect('area_id', areas, 'Área')}
      {multiSelect('rol_id', roles, 'Rol')}
      {multiSelect('sede_id', sedes, 'Sede')}

      <Popover open={openEstado} onOpenChange={setOpenEstado}>
        <PopoverTrigger
          render={
            <button className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card rounded-lg border inline-flex items-center gap-1 min-w-[100px]">
              <span className="truncate">
                {filters.estado === "true" ? "Activo" : filters.estado === "false" ? "Inactivo" : "Estado"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          }
        />
        <PopoverContent align="start" className="w-40 p-0">
          <Command>
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {[
                  { value: "", label: "Todos" },
                  { value: "true", label: "Activo" },
                  { value: "false", label: "Inactivo" },
                ].map((opt) => {
                  const isSelected = filters.estado === opt.value || (!filters.estado && !opt.value)
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => {
                        onFiltersChange({ ...filters, estado: opt.value })
                        setOpenEstado(false)
                      }}
                      className={isSelected ? "bg-accent" : undefined}
                    >
                      {opt.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <button
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <FilterX className="h-5 w-5" />
      </button>
    </div>
  )
}
