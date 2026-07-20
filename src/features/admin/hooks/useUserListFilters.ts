import { useState, useCallback } from 'react'

export type UserListFilters = {
  search: string
  area_id: string
  sede_id: string
  estado: string
}

export function useUserListFilters() {
  const [filters, setFilters] = useState<UserListFilters>({
    search: '',
    area_id: '',
    sede_id: '',
    estado: '',
  })

  const clearAllFilters = useCallback(() => {
    setFilters({ search: '', area_id: '', sede_id: '', estado: '' })
  }, [])

  const hasActiveFilters = !!(filters.search || filters.area_id || filters.sede_id || filters.estado)

  return { filters, onFiltersChange: setFilters, clearAllFilters, hasActiveFilters }
}
