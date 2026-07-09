import { useState, useCallback } from 'react'

export type UserListFilters = {
  search: string
  area_id: string
  rol_id: string
  estado: string
  sede_id: string
}

export function useUserListFilters() {
  const [filters, setFilters] = useState<UserListFilters>({
    search: '',
    area_id: '',
    rol_id: '',
    estado: '',
    sede_id: '',
  })

  const clearAllFilters = useCallback(() => {
    setFilters({ search: '', area_id: '', rol_id: '', estado: '', sede_id: '' })
  }, [])

  const hasActiveFilters = !!(filters.search || filters.area_id || filters.rol_id || filters.estado || filters.sede_id)

  return { filters, onFiltersChange: setFilters, clearAllFilters, hasActiveFilters }
}
