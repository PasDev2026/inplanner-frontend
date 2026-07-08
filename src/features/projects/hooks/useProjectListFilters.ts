import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterState = {
  search: string
  sede_id: string
  dateFrom: string
  dateTo: string
  filterType: string
  filterStatus: string
  responsible_id: string
}

export function useProjectListFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "")
  const [sedeInput, setSedeInput] = useState(() => searchParams.get("sede_id") || "")
  const [dateFromInput, setDateFromInput] = useState(() => searchParams.get("dateFrom") || "")
  const [dateToInput, setDateToInput] = useState(() => searchParams.get("dateTo") || "")
  const [filterTypeInput, setFilterTypeInput] = useState(() => searchParams.get("filterType") || "")
  const [filterStatusInput, setFilterStatusInput] = useState(() => searchParams.get("filterStatus") || "")
  const [responsibleInput, setResponsibleInput] = useState(() => searchParams.get("responsible_id") || "")

  const [sort, setSort] = useState<{ field: string; order: string } | null>(null)

  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>({
    search: searchInput,
    sede_id: sedeInput,
    dateFrom: dateFromInput,
    dateTo: dateToInput,
    filterType: filterTypeInput,
    filterStatus: filterStatusInput,
    responsible_id: responsibleInput,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search: searchInput, sede_id: sedeInput,
        dateFrom: dateFromInput, dateTo: dateToInput,
        filterType: filterTypeInput, filterStatus: filterStatusInput,
        responsible_id: responsibleInput,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, sedeInput, dateFromInput, dateToInput, filterTypeInput, filterStatusInput, responsibleInput])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const setOrDel = (key: string, val: string) => { if (val) next.set(key, val); else next.delete(key) }
    setOrDel("search", debouncedFilters.search)
    setOrDel("sede_id", debouncedFilters.sede_id)
    setOrDel("dateFrom", debouncedFilters.dateFrom)
    setOrDel("dateTo", debouncedFilters.dateTo)
    setOrDel("responsible_id", debouncedFilters.responsible_id)
    if (debouncedFilters.filterType && debouncedFilters.filterStatus) {
      next.set("filterType", debouncedFilters.filterType)
      next.set("filterStatus", debouncedFilters.filterStatus)
    } else {
      next.delete("filterType")
      next.delete("filterStatus")
    }
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters])

  const isSearching = searchInput !== debouncedFilters.search
    || sedeInput !== debouncedFilters.sede_id
    || dateFromInput !== debouncedFilters.dateFrom
    || dateToInput !== debouncedFilters.dateTo
    || filterTypeInput !== debouncedFilters.filterType
    || filterStatusInput !== debouncedFilters.filterStatus
    || responsibleInput !== debouncedFilters.responsible_id

  const hasActiveFilters = !!(debouncedFilters.search || debouncedFilters.sede_id || debouncedFilters.dateFrom || debouncedFilters.dateTo || debouncedFilters.filterType || debouncedFilters.responsible_id)

  const handleSort = useCallback((field: string) => {
    setSort(prev => {
      if (prev?.field === field) {
        if (prev.order === 'asc') return { field, order: 'desc' }
        return null
      }
      return { field, order: 'asc' }
    })
  }, [])

  const handleFilterChange = useCallback((type: 'project' | 'task' | null, status: string | null) => {
    setFilterTypeInput(type || "")
    setFilterStatusInput(status || "")
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setSedeInput("")
    setDateFromInput("")
    setDateToInput("")
    setFilterTypeInput("")
    setFilterStatusInput("")
    setResponsibleInput("")
  }, [])

  return {
    searchInput, setSearchInput,
    sedeInput, setSedeInput,
    dateFromInput, setDateFromInput,
    dateToInput, setDateToInput,
    filterTypeInput, filterStatusInput,
    responsibleInput, setResponsibleInput,
    sort, handleSort,
    handleFilterChange,
    clearAllFilters,
    debouncedFilters,
    isSearching,
    hasActiveFilters,
  }
}
