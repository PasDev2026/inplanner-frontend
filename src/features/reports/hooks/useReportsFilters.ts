import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type ReportsFilterState = {
  search: string
  sede_id: string
  responsible_id: string
  project_id: string
  dateFrom: string
  dateTo: string
  status: string
  priority: string
}

export function useReportsFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "")
  const [sedeInput, setSedeInput] = useState(() => searchParams.get("sede_id") || "")
  const [responsibleInput, setResponsibleInput] = useState(() => searchParams.get("responsible_id") || "")
  const [projectInput, setProjectInput] = useState(() => searchParams.get("project_id") || "")
  const [dateFromInput, setDateFromInput] = useState(() => searchParams.get("dateFrom") || "")
  const [dateToInput, setDateToInput] = useState(() => searchParams.get("dateTo") || "")
  const [statusInput, setStatusInput] = useState(() => searchParams.get("status") || "")
  const [priorityInput, setPriorityInput] = useState(() => searchParams.get("priority") || "")
  const [page, setPage] = useState(() => {
    const raw = Number(searchParams.get("page") || "1")
    return Number.isFinite(raw) && raw > 0 ? raw : 1
  })

  const [debouncedFilters, setDebouncedFilters] = useState<ReportsFilterState>({
    search: searchInput,
    sede_id: sedeInput,
    responsible_id: responsibleInput,
    project_id: projectInput,
    dateFrom: dateFromInput,
    dateTo: dateToInput,
    status: statusInput,
    priority: priorityInput,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search: searchInput, sede_id: sedeInput, responsible_id: responsibleInput,
        project_id: projectInput,
        dateFrom: dateFromInput, dateTo: dateToInput,
        status: statusInput, priority: priorityInput,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, sedeInput, responsibleInput, projectInput, dateFromInput, dateToInput, statusInput, priorityInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedFilters])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const setOrDel = (key: string, val: string) => { if (val) next.set(key, val); else next.delete(key) }
    setOrDel("search", debouncedFilters.search)
    setOrDel("sede_id", debouncedFilters.sede_id)
    setOrDel("responsible_id", debouncedFilters.responsible_id)
    setOrDel("project_id", debouncedFilters.project_id)
    setOrDel("dateFrom", debouncedFilters.dateFrom)
    setOrDel("dateTo", debouncedFilters.dateTo)
    setOrDel("status", debouncedFilters.status)
    setOrDel("priority", debouncedFilters.priority)
    if (page > 1) next.set("page", String(page)); else next.delete("page")
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, page])

  const isSearching = searchInput !== debouncedFilters.search
    || sedeInput !== debouncedFilters.sede_id
    || responsibleInput !== debouncedFilters.responsible_id
    || projectInput !== debouncedFilters.project_id
    || dateFromInput !== debouncedFilters.dateFrom
    || dateToInput !== debouncedFilters.dateTo
    || statusInput !== debouncedFilters.status
    || priorityInput !== debouncedFilters.priority

  const hasActiveFilters = !!(debouncedFilters.search || debouncedFilters.sede_id || debouncedFilters.responsible_id || debouncedFilters.project_id || debouncedFilters.dateFrom || debouncedFilters.dateTo || debouncedFilters.status || debouncedFilters.priority)

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setSedeInput("")
    setResponsibleInput("")
    setProjectInput("")
    setDateFromInput("")
    setDateToInput("")
    setStatusInput("")
    setPriorityInput("")
  }, [])

  return {
    searchInput, setSearchInput,
    sedeInput, setSedeInput,
    responsibleInput, setResponsibleInput,
    projectInput, setProjectInput,
    dateFromInput, setDateFromInput,
    dateToInput, setDateToInput,
    statusInput, setStatusInput,
    priorityInput, setPriorityInput,
    page, setPage,
    debouncedFilters,
    isSearching,
    hasActiveFilters,
    clearAllFilters,
  }
}
