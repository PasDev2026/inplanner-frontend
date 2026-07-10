import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterState = {
  search: string
  sede_id: string
  dateFrom: string
  dateTo: string
  status: string
  responsible_id: string
  priority: string
}

export function useProjectListFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "")
  const [sedeInput, setSedeInput] = useState(() => searchParams.get("sede_id") || "")
  const [dateFromInput, setDateFromInput] = useState(() => searchParams.get("dateFrom") || "")
  const [dateToInput, setDateToInput] = useState(() => searchParams.get("dateTo") || "")
  const [statusInput, setStatusInput] = useState(() => searchParams.get("status") || "")
  const [responsibleInput, setResponsibleInput] = useState(() => searchParams.get("responsible_id") || "")
  const [priorityInput, setPriorityInput] = useState(() => searchParams.get("priority") || "")

  const [sort, setSort] = useState<{ field: string; order: string } | null>(null)

  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>({
    search: searchInput,
    sede_id: sedeInput,
    dateFrom: dateFromInput,
    dateTo: dateToInput,
    status: statusInput,
    responsible_id: responsibleInput,
    priority: priorityInput,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search: searchInput, sede_id: sedeInput,
        dateFrom: dateFromInput, dateTo: dateToInput,
        status: statusInput,
        responsible_id: responsibleInput,
        priority: priorityInput,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, sedeInput, dateFromInput, dateToInput, statusInput, responsibleInput, priorityInput])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const setOrDel = (key: string, val: string) => { if (val) next.set(key, val); else next.delete(key) }
    setOrDel("search", debouncedFilters.search)
    setOrDel("sede_id", debouncedFilters.sede_id)
    setOrDel("dateFrom", debouncedFilters.dateFrom)
    setOrDel("dateTo", debouncedFilters.dateTo)
    setOrDel("status", debouncedFilters.status)
    setOrDel("responsible_id", debouncedFilters.responsible_id)
    setOrDel("priority", debouncedFilters.priority)
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters])

  const isSearching = searchInput !== debouncedFilters.search
    || sedeInput !== debouncedFilters.sede_id
    || dateFromInput !== debouncedFilters.dateFrom
    || dateToInput !== debouncedFilters.dateTo
    || statusInput !== debouncedFilters.status
    || responsibleInput !== debouncedFilters.responsible_id
    || priorityInput !== debouncedFilters.priority

  const hasActiveFilters = !!(debouncedFilters.search || debouncedFilters.sede_id || debouncedFilters.dateFrom || debouncedFilters.dateTo || debouncedFilters.status || debouncedFilters.responsible_id || debouncedFilters.priority)

  const handleSort = useCallback((field: string) => {
    setSort(prev => {
      if (prev?.field === field) {
        if (prev.order === 'asc') return { field, order: 'desc' }
        return null
      }
      return { field, order: 'asc' }
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setSedeInput("")
    setDateFromInput("")
    setDateToInput("")
    setStatusInput("")
    setResponsibleInput("")
    setPriorityInput("")
  }, [])

  return {
    searchInput, setSearchInput,
    sedeInput, setSedeInput,
    dateFromInput, setDateFromInput,
    dateToInput, setDateToInput,
    statusInput, setStatusInput,
    responsibleInput, setResponsibleInput,
    priorityInput, setPriorityInput,
    sort, handleSort,
    clearAllFilters,
    debouncedFilters,
    isSearching,
    hasActiveFilters,
  }
}
