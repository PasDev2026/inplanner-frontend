import { useState, useEffect } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { Search, X } from "lucide-react"
import { DateRangePicker } from "@/features/shared/components/DateRangePicker"
import { getProjects } from "@/features/shared/actions/project.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import Spinner from "@/components/ui/Spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useAuth } from "@/features/auth/hooks/useAuth"
import DeleteProjectModal from "@/features/projects/components/DeleteProjectModal"
import ScrollToTop from "@/components/ui/ScrollToTop"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import ProjectTableHeader from "@/features/projects/components/ProjectTableHeader"
import ProjectTableRow from "@/features/projects/components/ProjectTableRow"
import { Table, TableBody } from "@/components/ui/table"
import { BackendProject } from "@/features/shared/lib/types"

function toUTCDateString(date: Date | undefined) {
    if (!date) return ""
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, "0")
    const d = String(date.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export default function Dashboard() {
    const { data: user, isLoading: authLoading } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "")
    const [sedeInput, setSedeInput] = useState(() => searchParams.get("sede_id") || "")
    const [dateFromInput, setDateFromInput] = useState(() => searchParams.get("dateFrom") || "")
    const [dateToInput, setDateToInput] = useState(() => searchParams.get("dateTo") || "")
    const [filterTypeInput, setFilterTypeInput] = useState(() => searchParams.get("filterType") || "")
    const [filterStatusInput, setFilterStatusInput] = useState(() => searchParams.get("filterStatus") || "")

    const [sort, setSort] = useState<{ field: string; order: string } | null>(null)

    const { data: sedes } = useQuery({
        queryKey: ["sedes"],
        queryFn: getSedes,
    })

    const [debouncedFilters, setDebouncedFilters] = useState({
        search: searchInput,
        sede_id: sedeInput,
        dateFrom: dateFromInput,
        dateTo: dateToInput,
        filterType: filterTypeInput,
        filterStatus: filterStatusInput,
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters({
                search: searchInput,
                sede_id: sedeInput,
                dateFrom: dateFromInput,
                dateTo: dateToInput,
                filterType: filterTypeInput,
                filterStatus: filterStatusInput,
            })
        }, 350)
        return () => clearTimeout(timer)
    }, [searchInput, sedeInput, dateFromInput, dateToInput, filterTypeInput, filterStatusInput])

    useEffect(() => {
        const next = new URLSearchParams(searchParams)
        if (debouncedFilters.search) next.set("search", debouncedFilters.search)
        else next.delete("search")
        if (debouncedFilters.sede_id) next.set("sede_id", debouncedFilters.sede_id)
        else next.delete("sede_id")
        if (debouncedFilters.dateFrom) next.set("dateFrom", debouncedFilters.dateFrom)
        else next.delete("dateFrom")
        if (debouncedFilters.dateTo) next.set("dateTo", debouncedFilters.dateTo)
        else next.delete("dateTo")
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

    const {
        data,
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["projects", debouncedFilters],
        queryFn: async ({ pageParam }) => {
            const result = await getProjects({
                search: debouncedFilters.search || undefined,
                sede_id: debouncedFilters.sede_id ? Number(debouncedFilters.sede_id) : undefined,
                status: debouncedFilters.filterType === 'project' ? (debouncedFilters.filterStatus ? Number(debouncedFilters.filterStatus) : undefined) : undefined,
                dateFrom: debouncedFilters.dateFrom || undefined,
                dateTo: debouncedFilters.dateTo || undefined,
                page: pageParam as number,
                limit: 10,
            })
            if (!result) throw new Error("No data")
            return result
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.meta
            return page < totalPages ? page + 1 : undefined
        },
        retry: false,
        placeholderData: (prev) => prev,
    })

    const projects = data?.pages.flatMap(page => page.data) ?? []

    const sortedProjects = sort
        ? [...projects].sort((a, b) => {
            const cmp = a.name_project.localeCompare(b.name_project, 'es', { sensitivity: 'base' })
            return sort.order === 'desc' ? -cmp : cmp
        })
        : projects

    const filteredProjects = debouncedFilters.filterType === 'project' && debouncedFilters.filterStatus
        ? sortedProjects.filter(p => p.status === Number(debouncedFilters.filterStatus))
        : sortedProjects

    const isSearching = searchInput !== debouncedFilters.search
        || sedeInput !== debouncedFilters.sede_id
        || dateFromInput !== debouncedFilters.dateFrom
        || dateToInput !== debouncedFilters.dateTo
        || filterTypeInput !== debouncedFilters.filterType
        || filterStatusInput !== debouncedFilters.filterStatus

    const hasActiveFilters = debouncedFilters.search || debouncedFilters.sede_id || debouncedFilters.dateFrom || debouncedFilters.dateTo || debouncedFilters.filterType

    const handleSort = (field: string) => {
        setSort(prev => {
            if (prev?.field === field) {
                if (prev.order === 'asc') return { field, order: 'desc' }
                return null
            }
            return { field, order: 'asc' }
        })
    }

    const handleFilterChange = (type: 'project' | 'task' | null, status: string | null) => {
        setFilterTypeInput(type || "")
        setFilterStatusInput(status || "")
    }

    const clearAllFilters = () => {
        setSearchInput("")
        setSedeInput("")
        setDateFromInput("")
        setDateToInput("")
        setFilterTypeInput("")
        setFilterStatusInput("")
    }

    if (isLoading || authLoading) return <Spinner />
    if (data && user)
        return (
            <div>
                <h1 className="text-5xl font-black">Mis proyectos</h1>
                <p className="text-2xl font-light text-gray-500 mt-5">
                    Maneja y administra tus proyectos
                </p>

                <div className="flex flex-wrap items-end gap-3 mt-8">
                    <div className="relative flex-1 min-w-[300px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar proyecto..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                        />
                        {searchInput && !(isSearching || isFetching) && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                        {/* {(isSearching || isFetching) && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner fullPage={false} size={12} />
                            </div>
                        )} */}
                    </div>

                    <Select
                        value={sedeInput}
                        onValueChange={(v) => setSedeInput(v ?? "")}
                    >
                        <Select.Trigger className="shrink-0 px-3 py-2.5 h-auto text-sm border-slate-200 shadow-sm">
                            <Select.Value placeholder="Todas las sedes">
                                {sedeInput ? sedes?.find((s) => String(s.id) === sedeInput)?.nombre : "Todas las sedes"}
                            </Select.Value>
                        </Select.Trigger>
                        <Select.Popup>
                            <Select.List>
                                <Select.Item value="">Todas las sedes</Select.Item>
                                {sedes?.map((sede) => (
                                    <Select.Item key={sede.id} value={String(sede.id)}>{sede.nombre}</Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                    </Select>
                    <DateRangePicker
                        dateRange={
                            dateFromInput || dateToInput
                                ? {
                                    from: dateFromInput
                                        ? (([y,m,d]) => new Date(+y, +m-1, +d))(dateFromInput.split("-") as [string, string, string])
                                        : undefined,
                                    to: dateToInput
                                        ? (([y,m,d]) => new Date(+y, +m-1, +d))(dateToInput.split("-") as [string, string, string])
                                        : undefined,
                                }
                                : undefined
                        }
                        onSelect={(range) => {
                            if (!range) {
                                setDateFromInput("")
                                setDateToInput("")
                                return
                            }
                            setDateFromInput(toUTCDateString(range.from))
                            setDateToInput(toUTCDateString(range.to))
                        }}
                        className="shrink-0"
                    />

                    {(searchInput || sedeInput || dateFromInput || dateToInput) && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                        >
                            <X className="h-4 w-4" />
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {filteredProjects.length ? (
                    <Card className="mt-6">
                        <CardContent className="p-0">
                        <Table className="table-fixed">
                        <colgroup>
                          {COL_GROUP.map((c, i) => (
                            <col key={i} style={{ width: c.width }} />
                          ))}
                        </colgroup>
                        <ProjectTableHeader
                            sortBy={sort?.field}
                            sortOrder={sort?.order}
                            onSort={handleSort}
                            filterType={(filterTypeInput || null) as 'project' | 'task' | null}
                            filterStatus={filterStatusInput || null}
                            onFilterChange={handleFilterChange}
                        />
                        <TableBody>
                        {filteredProjects.map((project: BackendProject) => (
                            <ProjectTableRow
                                key={project.id_project}
                                project={project}
                                user={user}
                                sedes={sedes ?? []}
                                filterType={(filterTypeInput || null) as 'project' | 'task' | null}
                                filterStatus={filterStatusInput || null}
                                forceExpanded={filterTypeInput === "task" && !!filterStatusInput}
                            />
                        ))}
                        </TableBody>
                        </Table>
                        {hasNextPage && (
                            <div className="flex justify-center py-4">
                                <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    variant="outline"
                                >
                                    {isFetchingNextPage ? "Cargando..." : "Cargar más"}
                                </Button>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                ) : hasActiveFilters ? (
                    <p className="text-xl font-light text-gray-500 mt-10 text-center">
                        No se encontraron resultados
                        {debouncedFilters.search && (
                            <> para <span className="font-medium">&quot;{debouncedFilters.search}&quot;</span></>
                        )}
                        {(debouncedFilters.dateFrom || debouncedFilters.dateTo) && (
                            <> en el rango de fechas seleccionado</>
                        )}
                        {debouncedFilters.sede_id && (
                            <> en la sede seleccionada</>
                        )}
                    </p>
                ) : (
                    <p className="text-2xl font-light text-gray-500 mt-5">
                        No hay proyectos aún
                    </p>
                )}
                <DeleteProjectModal />
                <ScrollToTop />
            </div>
        )
}
