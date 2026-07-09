import { ChevronUp, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { COL_GROUP, TABLE_GRID } from "@/features/shared/lib/tableColumns"
import ProjectTableRow from "@/features/projects/components/ProjectTableRow"
import { LoadMoreButton } from "@/components/ui/pagination"
import StatusColumnFilter from "@/features/shared/components/StatusColumnFilter"
import ResponsibleColumnFilter from "@/features/shared/components/ResponsibleColumnFilter"
import PriorityColumnFilter from "@/features/shared/components/PriorityColumnFilter"
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
  responsibleId: number | null
  onResponsibleFilter: (userId: number | null) => void
  priorityId: number | null
  onPriorityFilter: (value: number | null) => void
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
  responsibleId, onResponsibleFilter,
  priorityId, onPriorityFilter,
  onLoadMore, hasMore, isLoadingMore,
  hasActiveFilters, searchTerm, dateFrom, dateTo,
  user, sedes,
}: ProjectTableSectionProps) {
  // ponytail: sortIcon duplicated from ProjectTableHeader — no extraction needed for one usage
  const sortIcon = (field: string) => {
    const isActive = sort?.field === field
    return (
      <span className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <ChevronUp className={`h-3 w-3 ${isActive && sort?.order === 'asc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
        <ChevronDown className={`h-3 w-3 ${isActive && sort?.order === 'desc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
      </span>
    )
  }

  // ponytail: sticky header as grid outside overflow-x-auto — avoids scroll container breaking position: sticky
  const stickyHeader = (
    <div
      className="sticky top-[69px] z-10 bg-background border-b border-border grid items-center whitespace-nowrap text-sm font-medium"
      style={{ gridTemplateColumns: TABLE_GRID, minHeight: '2.5rem' }}
    >
      <div />
      <div className="cursor-pointer select-none group flex items-center gap-1.5 text-foreground px-2" onClick={() => onSort('name_project')}>
        <span>Proyecto</span>
        {sortIcon('name_project')}
      </div>
      <div className="text-foreground px-2 flex items-center">Sede</div>
      <div className="px-2 flex items-center">
        <StatusColumnFilter
          filterType={filterType as 'project' | 'task' | null}
          filterStatus={filterStatus}
          onChange={onFilterChange}
        />
      </div>
      <div className="group flex items-center gap-1 cursor-pointer select-none text-foreground px-2" onClick={() => onSort('responsible_name')}>
        <ResponsibleColumnFilter
          responsibleId={responsibleId}
          onChange={onResponsibleFilter}
        />
        {sortIcon('responsible_name')}
      </div>
      <div className="px-2 flex items-center">
        <PriorityColumnFilter
          priorityId={priorityId}
          onChange={onPriorityFilter}
        />
      </div>
      <div className="text-foreground px-2 flex items-center">Fecha</div>
      <div className="text-foreground px-2 flex items-center">Progreso</div>
      <div />
    </div>
  )

  if (!projects.length && !hasActiveFilters) {
    return (
      <p className="text-2xl font-light text-muted-foreground mt-5">
        No hay proyectos aún
      </p>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 flex flex-col">
        {stickyHeader}
        <div className="overflow-x-auto">
          {projects.length > 0 ? (
            <Table className="table-fixed">
              <colgroup>
                {COL_GROUP.map((c, i) => (
                  <col key={i} style={{ width: c.width }} />
                ))}
              </colgroup>
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
          ) : (
            <div className="text-center text-xl font-light text-muted-foreground py-10">
              No se encontraron resultados
              {searchTerm && <> para <span className="font-medium">&quot;{searchTerm}&quot;</span></>}
              {(dateFrom || dateTo) && <> en el rango de fechas seleccionado</>}
            </div>
          )}
        </div>
        {projects.length > 0 && (
          <LoadMoreButton
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoading={isLoadingMore}
          />
        )}
      </CardContent>
    </Card>
  )
}
