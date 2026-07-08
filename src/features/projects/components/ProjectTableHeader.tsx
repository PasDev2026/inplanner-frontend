import { ChevronUp, ChevronDown } from "lucide-react"
import { TableHeader, TableRow, TableHead } from "@/components/ui/table"
import StatusColumnFilter from "@/features/shared/components/StatusColumnFilter"
import ResponsibleColumnFilter from "@/features/shared/components/ResponsibleColumnFilter"

type ProjectTableHeaderProps = {
  sortBy?: string
  sortOrder?: string
  onSort: (field: string) => void
  filterType: 'project' | 'task' | null
  filterStatus: string | null
  onFilterChange: (type: 'project' | 'task' | null, status: string | null) => void
  responsibleId: number | null
  onResponsibleFilter: (userId: number | null) => void
}

export default function ProjectTableHeader({ sortBy, sortOrder, onSort, filterType, filterStatus, onFilterChange, responsibleId, onResponsibleFilter }: ProjectTableHeaderProps) {
  const sortIcon = (field: string) => {
    const isActive = sortBy === field
    return (
      <span className="flex flex-col -space-y-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <ChevronUp className={`h-3 w-3 ${isActive && sortOrder === 'asc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
        <ChevronDown className={`h-3 w-3 ${isActive && sortOrder === 'desc' ? 'opacity-100 text-brand-primary' : 'opacity-30'}`} />
      </span>
    )
  }

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent border-b border-border">
        <TableHead />
        <TableHead
          className="cursor-pointer select-none group"
          onClick={() => onSort('name_project')}
        >
          <div className="flex items-center gap-1.5">
            <span>Proyecto</span>
            {sortIcon('name_project')}
          </div>
        </TableHead>
        <TableHead>Sede</TableHead>
        <TableHead>
          <StatusColumnFilter
            filterType={filterType}
            filterStatus={filterStatus}
            onChange={onFilterChange}
          />
        </TableHead>
        <TableHead className="group cursor-pointer select-none" onClick={() => onSort('responsible_name')}>
          <div className="flex items-center gap-1">
            <ResponsibleColumnFilter
              responsibleId={responsibleId}
              onChange={onResponsibleFilter}
            />
            {sortIcon('responsible_name')}
          </div>
        </TableHead>
        <TableHead>Prioridad</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Progreso</TableHead>
        <TableHead />
      </TableRow>
    </TableHeader>
  )
}
