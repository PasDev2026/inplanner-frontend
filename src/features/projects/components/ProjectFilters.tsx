import { useState } from "react"
import { Search, FilterX, ChevronDown } from "lucide-react"
import { DateRangePicker } from "@/features/shared/components/DateRangePicker"
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

function toUTCDateString(date: Date | undefined) {
  if (!date) return ""
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

interface ProjectFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  sede: string
  onSedeChange: (v: string) => void
  dateFrom: string
  dateTo: string
  onDateRangeChange: (from: string, to: string) => void
  isSearching: boolean
  sedes: CentralizadoItem[]
  onClearAll: () => void
}

export function ProjectFilters({
  search, onSearchChange,
  sede, onSedeChange,
  dateFrom, dateTo, onDateRangeChange,
  isSearching, sedes,
  onClearAll,
}: ProjectFiltersProps) {
  const [open, setOpen] = useState(false)

  const selectedSedes = sede ? sede.split(",").filter(Boolean) : []
  const selectedLabels = selectedSedes
    .map(id => sedes?.find(s => s.id === id)?.nombre)
    .filter(Boolean)
  const triggerLabel = selectedLabels.length ? selectedLabels.join(", ") : "Todas las sedes"

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar proyecto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-card shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
        />
        {search && !isSearching && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FilterX className="h-5 w-5" />
          </button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card rounded-lg border inline-flex items-center gap-1 min-w-[150px] max-w-[220px]">
              <span className="truncate">{triggerLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          }
        />
        <PopoverContent align="start" className="w-56 p-0">
          <Command>
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => { onSedeChange(""); setOpen(false) }}
                  className={!selectedSedes.length ? "bg-accent" : undefined}
                >
                  Todas las sedes
                </CommandItem>
                {sedes?.map((s) => {
                  const isSelected = selectedSedes.includes(s.id)
                  return (
                    <CommandItem
                      key={s.id}
                      value={String(s.id)}
                      onSelect={() => {
                        const next = isSelected
                          ? selectedSedes.filter(id => id !== s.id)
                          : [...selectedSedes, s.id]
                        onSedeChange(next.join(","))
                      }}
                      className={isSelected ? "bg-accent" : undefined}
                    >
                      {s.nombre}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DateRangePicker
        dateRange={
          dateFrom || dateTo
            ? {
                from: dateFrom
                  ? (([y,m,d]) => new Date(+y, +m-1, +d))(dateFrom.split("-") as [string, string, string])
                  : undefined,
                to: dateTo
                  ? (([y,m,d]) => new Date(+y, +m-1, +d))(dateTo.split("-") as [string, string, string])
                  : undefined,
              }
            : undefined
        }
        onSelect={(range) => {
          if (!range) {
            onDateRangeChange("", "")
            return
          }
          onDateRangeChange(toUTCDateString(range.from), toUTCDateString(range.to))
        }}
      />

      <button
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <FilterX className="h-5 w-5" />
      </button>
    </div>
  )
}
