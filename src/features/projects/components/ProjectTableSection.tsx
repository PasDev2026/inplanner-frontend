import { ChevronUp, ChevronDown, FolderOpen, SearchX } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
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
import type { AuthUser } from "@/features/auth/actions/auth.api"
import { useRef, useCallback } from "react"

interface ProjectTableSectionProps {
  projects: BackendProject[]
  sort: { field: string; order: string } | null
  onSort: (field: string) => void
  statusSelected: string[]
  onStatusFilter: (values: string[]) => void
  responsibleSelected: string[]
  onResponsibleFilter: (ids: string[]) => void
  prioritySelected: number[]
  onPriorityFilter: (values: number[]) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
  hasActiveFilters: boolean
  searchTerm: string
  dateFrom: string
  dateTo: string
  user: AuthUser
  sedes: CentralizadoItem[]
}

export function ProjectTableSection({
  projects, sort, onSort,
  statusSelected, onStatusFilter,
  responsibleSelected, onResponsibleFilter,
  prioritySelected, onPriorityFilter,
  onLoadMore, hasMore, isLoadingMore,
  hasActiveFilters, searchTerm, dateFrom, dateTo,
  user, sedes,
}: ProjectTableSectionProps) {
  const sortIcon = (field: string) => {
    const isActive = sort?.field === field
    return (
      <span className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <ChevronUp className={`h-3 w-3 ${isActive && sort?.order === 'asc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
        <ChevronDown className={`h-3 w-3 ${isActive && sort?.order === 'desc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
      </span>
    )
  }

  const headerScrollRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (headerScrollRef.current && scrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft
    }
  }, [])

  const stickyHeader = (
    <div
      className="sticky top-[69px] z-10 bg-background border-b border-border"
      style={{ overflow: 'clip' }}
    >
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} ref={headerScrollRef}>
        <div
          className="grid items-center whitespace-nowrap text-sm font-medium"
          style={{
            gridTemplateColumns: TABLE_GRID,
            minHeight: '2.5rem',
            minWidth: '1080px',
          }}
        >
          <div />
          <div className="cursor-pointer select-none group flex items-center gap-1.5 text-foreground px-2" onClick={() => onSort('name_project')}>
            <span>Proyecto</span>
            {sortIcon('name_project')}
          </div>
          <div className="text-foreground px-2 flex items-center">Sede</div>
          <div className="px-2 flex items-center">
            <StatusColumnFilter
              selected={statusSelected}
              onChange={onStatusFilter}
            />
          </div>
          <div className="group flex items-center gap-1 cursor-pointer select-none text-foreground px-2" onClick={() => onSort('responsible_name')}>
            <ResponsibleColumnFilter
              selected={responsibleSelected}
              onChange={onResponsibleFilter}
            />
            {sortIcon('responsible_name')}
          </div>
          <div className="px-2 flex items-center">
            <PriorityColumnFilter
              selected={prioritySelected}
              onChange={onPriorityFilter}
            />
          </div>
          <div className="text-foreground px-2 flex items-center">Fecha</div>
          <div className="text-foreground px-2 flex items-center">Progreso</div>
          <div />
        </div>
      </div>
    </div>
  )

  if (!projects.length && !hasActiveFilters) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen />
          </EmptyMedia>
          <EmptyTitle>No hay proyectos aún</EmptyTitle>
          <EmptyDescription>
            Crea tu primer proyecto para comenzar a gestionar tus tareas.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="p-0 flex flex-col">
        {stickyHeader}
        <div ref={scrollRef} className="overflow-x-auto" onScroll={handleScroll}>
          {projects.length > 0 ? (
            <div style={{ minWidth: '1080px' }}>
              <Table className="table-fixed w-full">
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
                      filterType={statusSelected.length ? 'project' : null}
                      filterStatus={statusSelected.length ? statusSelected[0] : null}
                      forceExpanded={false}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>Sin resultados</EmptyTitle>
                <EmptyDescription>
                  No se encontraron proyectos
                  {searchTerm && <> para <strong>&quot;{searchTerm}&quot;</strong></>}
                  {(dateFrom || dateTo) && <> en el rango de fechas seleccionado</>}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
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
