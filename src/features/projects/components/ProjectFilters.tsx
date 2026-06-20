import { Search, X } from "lucide-react"
import { DateRangePicker } from "@/features/shared/components/DateRangePicker"
import { Select } from "@/components/ui/select"
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
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Select
        value={sede}
        onValueChange={(v) => onSedeChange(v ?? "")}
      >
        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm">
          <Select.Value placeholder="Todas las sedes">
            {sede ? sedes?.find((s) => String(s.id) === sede)?.nombre : "Todas las sedes"}
          </Select.Value>
        </Select.Trigger>
        <Select.Popup>
          <Select.List>
            <Select.Item value="">Todas las sedes</Select.Item>
            {sedes?.map((s) => (
              <Select.Item key={s.id} value={String(s.id)}>{s.nombre}</Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select>

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

      {(search || sede || dateFrom || dateTo) && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
