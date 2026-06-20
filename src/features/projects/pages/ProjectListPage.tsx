import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"
import { PROJECTS_FILTERED_KEY } from "@/features/projects/lib/project-keys"
import { getProjects } from "@/features/shared/actions/project.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { useAuth } from "@/features/auth/hooks/useAuth"
import PageSpinner from "@/components/ui/PageSpinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import DeleteProjectModal from "@/features/projects/components/DeleteProjectModal"
import ScrollToTop from "@/components/ui/ScrollToTop"
import { useProjectListFilters } from "@/features/projects/hooks/useProjectListFilters"
import { ProjectFilters } from "@/features/projects/components/ProjectFilters"
import { ProjectTableSection } from "@/features/projects/components/ProjectTableSection"

export default function ProjectListPage() {
  const filters = useProjectListFilters()
  const { data: user, isLoading: authLoading } = useAuth()

  const { data: sedes } = useQuery({
    queryKey: SEDES_KEY,
    queryFn: getSedes,
  })

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: PROJECTS_FILTERED_KEY(filters.debouncedFilters),
    queryFn: async ({ pageParam }) => {
      const result = await getProjects({
        search: filters.debouncedFilters.search || undefined,
        sede_id: filters.debouncedFilters.sede_id ? Number(filters.debouncedFilters.sede_id) : undefined,
        status: filters.debouncedFilters.filterType === 'project'
          ? (filters.debouncedFilters.filterStatus ? Number(filters.debouncedFilters.filterStatus) : undefined)
          : undefined,
        dateFrom: filters.debouncedFilters.dateFrom || undefined,
        dateTo: filters.debouncedFilters.dateTo || undefined,
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
    staleTime: 60_000,
    retry: false,
    placeholderData: (prev) => prev,
  })

  if (isLoading || authLoading) return <PageSpinner />

  const projects = data?.pages.flatMap(page => page.data) ?? []

  const sortedProjects = filters.sort
    ? [...projects].sort((a, b) => {
        const cmp = a.name_project.localeCompare(b.name_project, 'es', { sensitivity: 'base' })
        return filters.sort!.order === 'desc' ? -cmp : cmp
      })
    : projects

  const filteredProjects = filters.debouncedFilters.filterType === 'project' && filters.debouncedFilters.filterStatus
    ? sortedProjects.filter(p => p.status === Number(filters.debouncedFilters.filterStatus))
    : sortedProjects

  return (
    <div className="flex flex-col gap-4 md:gap-4 md:py-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mis proyectos</CardTitle>
          <CardDescription className="text-2xl font-light text-muted-foreground">
            Maneja y administra tus proyectos
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-4">
          <ProjectFilters
            search={filters.searchInput}
            onSearchChange={filters.setSearchInput}
            sede={filters.sedeInput}
            onSedeChange={filters.setSedeInput}
            dateFrom={filters.dateFromInput}
            dateTo={filters.dateToInput}
            onDateRangeChange={(from, to) => {
              filters.setDateFromInput(from)
              filters.setDateToInput(to)
            }}
        isSearching={filters.isSearching || isFetching}
        sedes={sedes ?? []}
        onClearAll={filters.clearAllFilters}
          />
        </CardContent>
      </Card>

      <ProjectTableSection
        projects={filteredProjects}
        sort={filters.sort}
        onSort={filters.handleSort}
        filterType={filters.filterTypeInput || null}
        filterStatus={filters.filterStatusInput || null}
        onFilterChange={filters.handleFilterChange}
        onLoadMore={fetchNextPage}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        hasActiveFilters={filters.hasActiveFilters}
        searchTerm={filters.debouncedFilters.search}
        dateFrom={filters.dateFromInput}
        dateTo={filters.dateToInput}
        user={user!}
        sedes={sedes ?? []}
      />

      <DeleteProjectModal />
      <ScrollToTop />
    </div>
  )
}
