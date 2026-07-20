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
  sedes: CentralizadoItem[]
  onClearAll: () => void
}

export function UserFilters({
  filters,
  onFiltersChange,
  areas,
  sedes,
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

  const [openArea, setOpenArea] = useState(false)
  const [openSede, setOpenSede] = useState(false)
  const [openEstado, setOpenEstado] = useState(false)

  const selectedAreaIds = filters.area_id ? filters.area_id.split(",").filter(Boolean) : []
  const selectedAreaLabels = selectedAreaIds.map(id => areas?.find(i => i.id === id)?.nombre).filter(Boolean)
  const areaTriggerLabel = selectedAreaLabels.length ? selectedAreaLabels.join(", ") : "Área"

  const selectedSedeIds = filters.sede_id ? filters.sede_id.split(",").filter(Boolean) : []
  const selectedSedeLabels = selectedSedeIds.map(id => sedes?.find(i => i.id === id)?.nombre).filter(Boolean)
  const sedeTriggerLabel = selectedSedeLabels.length ? selectedSedeLabels.join(", ") : "Sede"

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

      <Popover open={openArea} onOpenChange={setOpenArea}>
        <PopoverTrigger
          render={
            <button className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card rounded-lg border inline-flex items-center gap-1 min-w-[130px] max-w-[200px]">
              <span className="truncate">{areaTriggerLabel}</span>
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
                  onSelect={() => { onFiltersChange({ ...filters, area_id: "" }); setOpenArea(false) }}
                  className={!selectedAreaIds.length ? "bg-accent" : undefined}
                >
                  Todas las áreas
                </CommandItem>
                {areas?.map((item) => {
                  const isSelected = selectedAreaIds.includes(item.id)
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        const next = isSelected
                          ? selectedAreaIds.filter(id => id !== item.id)
                          : [...selectedAreaIds, item.id]
                        onFiltersChange({ ...filters, area_id: next.join(",") })
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

      <Popover open={openSede} onOpenChange={setOpenSede}>
        <PopoverTrigger
          render={
            <button className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card rounded-lg border inline-flex items-center gap-1 min-w-[130px] max-w-[200px]">
              <span className="truncate">{sedeTriggerLabel}</span>
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
                  onSelect={() => { onFiltersChange({ ...filters, sede_id: "" }); setOpenSede(false) }}
                  className={!selectedSedeIds.length ? "bg-accent" : undefined}
                >
                  Todas las sedes
                </CommandItem>
                {sedes?.map((item) => {
                  const isSelected = selectedSedeIds.includes(item.id)
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        const next = isSelected
                          ? selectedSedeIds.filter(id => id !== item.id)
                          : [...selectedSedeIds, item.id]
                        onFiltersChange({ ...filters, sede_id: next.join(",") })
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
