import { useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { SEDES_KEY } from "@/features/shared/lib/shared-keys"
import { PROJECTS_FILTERED_KEY } from "@/features/projects/lib/project-keys"
import { getProjects } from "@/features/projects/actions/project.api"
import { getSedes } from "@/features/shared/actions/centralizado.api"
import { useAuth } from "@/features/auth/hooks/useAuth"
import PageSpinner from "@/components/ui/PageSpinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { List, Columns3 } from "lucide-react"
import DeleteProjectModal from "@/features/projects/components/DeleteProjectModal"
import ScrollToTop from "@/components/ui/ScrollToTop"
import { useProjectListFilters } from "@/features/projects/hooks/useProjectListFilters"
import { ProjectFilters } from "@/features/projects/components/ProjectFilters"
import { ProjectTableSection } from "@/features/projects/components/ProjectTableSection"
import ProjectKanbanBoard from "@/features/projects/kanban/ProjectKanbanBoard"

export default function ProjectsView() {
  const [view, setView] = useState<'list' | 'kanban'>('list')
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
        sede_id: filters.debouncedFilters.sede_id || undefined,
        status: filters.debouncedFilters.status || undefined,
        responsible_id: filters.debouncedFilters.responsible_id || undefined,
        priority: filters.debouncedFilters.priority || undefined,
        dateFrom: filters.debouncedFilters.dateFrom || undefined,
        dateTo: filters.debouncedFilters.dateTo || undefined,
        sortBy: filters.sort?.field,
        sortOrder: filters.sort?.order,
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

  return (
    <div className="flex flex-col gap-4 md:gap-4 md:py-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">Mis proyectos</CardTitle>
            <CardDescription className="text-2xl font-light text-muted-foreground">
              Maneja y administra tus proyectos
            </CardDescription>
          </div>
          <ButtonGroup>
            <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
              <List className="w-4 h-4 mr-2" />Lista
            </Button>
            <Button variant={view === 'kanban' ? 'default' : 'outline'} onClick={() => setView('kanban')}>
              <Columns3 className="w-4 h-4 mr-2" />Kanban
            </Button>
          </ButtonGroup>
        </CardHeader>
      </Card>

      {view === 'list' ? (
        <>
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
            projects={projects}
            sort={filters.sort}
            onSort={filters.handleSort}
            statusSelected={filters.debouncedFilters.status ? filters.debouncedFilters.status.split(",").filter(Boolean) : []}
            onStatusFilter={(values) => filters.setStatusInput(values.join(","))}
            responsibleSelected={filters.debouncedFilters.responsible_id ? filters.debouncedFilters.responsible_id.split(",").map(Number) : []}
            onResponsibleFilter={(ids) => filters.setResponsibleInput(ids.join(","))}
            prioritySelected={filters.debouncedFilters.priority ? filters.debouncedFilters.priority.split(",").map(Number) : []}
            onPriorityFilter={(values) => filters.setPriorityInput(values.join(","))}
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
        </>
      ) : (
        <ProjectKanbanBoard />
      )}

      <ScrollToTop />
    </div>
  )
}
