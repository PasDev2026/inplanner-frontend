import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Select } from "@/components/ui/select"
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
  }, [localSearch])

  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  const hasFilters = !!(filters.search || filters.area_id || filters.rol_id || filters.estado || filters.sede_id)

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

      <Select value={filters.area_id} onValueChange={(v) => onFiltersChange({ ...filters, area_id: v ?? "" })}>
        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card">
          <Select.Value placeholder="Área">
            {filters.area_id ? areas?.find((a) => String(a.id) === filters.area_id)?.nombre : "Área"}
          </Select.Value>
        </Select.Trigger>
        <Select.Popup>
          <Select.List>
            <Select.Item value="">Todas las áreas</Select.Item>
            {areas?.map((a) => (
              <Select.Item key={a.id} value={String(a.id)}>{a.nombre}</Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select>

      <Select value={filters.rol_id} onValueChange={(v) => onFiltersChange({ ...filters, rol_id: v ?? "" })}>
        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card">
          <Select.Value placeholder="Rol">
            {filters.rol_id ? roles?.find((r) => String(r.id) === filters.rol_id)?.nombre : "Rol"}
          </Select.Value>
        </Select.Trigger>
        <Select.Popup>
          <Select.List>
            <Select.Item value="">Todos los roles</Select.Item>
            {roles?.map((r) => (
              <Select.Item key={r.id} value={String(r.id)}>{r.nombre}</Select.Item>
            ))}
          </Select.List>
        </Select.Popup>
      </Select>

      <Select value={filters.estado} onValueChange={(v) => onFiltersChange({ ...filters, estado: v ?? "" })}>
        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card">
          <Select.Value placeholder="Estado">
            {filters.estado === "true" ? "Activo" : filters.estado === "false" ? "Inactivo" : "Estado"}
          </Select.Value>
        </Select.Trigger>
        <Select.Popup>
          <Select.List>
            <Select.Item value="">Todos</Select.Item>
            <Select.Item value="true">Activo</Select.Item>
            <Select.Item value="false">Inactivo</Select.Item>
          </Select.List>
        </Select.Popup>
      </Select>

      <Select value={filters.sede_id} onValueChange={(v) => onFiltersChange({ ...filters, sede_id: v ?? "" })}>
        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-border shadow-sm bg-card">
          <Select.Value placeholder="Sede">
            {filters.sede_id ? sedes?.find((s) => String(s.id) === filters.sede_id)?.nombre : "Sede"}
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

      {hasFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      )}
    </div>
  )
}
