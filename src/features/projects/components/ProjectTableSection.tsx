import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import ProjectTableHeader from "@/features/projects/components/ProjectTableHeader"
import ProjectTableRow from "@/features/projects/components/ProjectTableRow"
import { LoadMoreButton } from "@/components/ui/pagination"
import type { BackendProject } from "@/features/shared/lib/types"
import type { CentralizadoItem } from "@/features/shared/actions/centralizado.api"
import type { BackendUserProfile } from "@/features/auth/actions/auth.api"

interface ProjectTableSectionProps {
  projects: BackendProject[]
  sort: { field: string; order: string } | null
  onSort: (field: string) => void
  filterType: string | null
  filterStatus: string | null
  onFilterChange: (type: 'project' | 'task' | null, status: string | null) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
  hasActiveFilters: boolean
  searchTerm: string
  dateFrom: string
  dateTo: string
  user: BackendUserProfile
  sedes: CentralizadoItem[]
}

export function ProjectTableSection({
  projects, sort, onSort,
  filterType, filterStatus, onFilterChange,
  onLoadMore, hasMore, isLoadingMore,
  hasActiveFilters, searchTerm, dateFrom, dateTo,
  user, sedes,
}: ProjectTableSectionProps) {
  if (!projects.length) {
    if (hasActiveFilters) {
      return (
        <p className="text-xl font-light text-muted-foreground mt-10 text-center">
          No se encontraron resultados
          {searchTerm && <> para <span className="font-medium">&quot;{searchTerm}&quot;</span></>}
          {(dateFrom || dateTo) && <> en el rango de fechas seleccionado</>}
        </p>
      )
    }
    return (
      <p className="text-2xl font-light text-muted-foreground mt-5">
        No hay proyectos aún
      </p>
    )
  }

  return (
    <Card>
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
            onSort={onSort}
            filterType={filterType as 'project' | 'task' | null}
            filterStatus={filterStatus}
            onFilterChange={onFilterChange}
          />
          <TableBody>
            {projects.map((project) => (
              <ProjectTableRow
                key={project.id_project}
                project={project}
                user={user}
                sedes={sedes}
                filterType={filterType as 'project' | 'task' | null}
                filterStatus={filterStatus}
                forceExpanded={filterType === "task" && !!filterStatus}
              />
            ))}
          </TableBody>
        </Table>
        <LoadMoreButton
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoading={isLoadingMore}
        />
      </CardContent>
    </Card>
  )
}
