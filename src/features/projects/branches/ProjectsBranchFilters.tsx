import StatusColumnFilter from "@/features/shared/components/StatusColumnFilter"
import ResponsibleColumnFilter from "@/features/shared/components/ResponsibleColumnFilter"
import PriorityColumnFilter from "@/features/shared/components/PriorityColumnFilter"

type ProjectsBranchFiltersProps = {
  statusSelected: string[]
  onStatusChange: (values: string[]) => void
  responsibleSelected: string[]
  onResponsibleChange: (ids: string[]) => void
  prioritySelected: number[]
  onPriorityChange: (values: number[]) => void
}

export default function ProjectsBranchFilters({
  statusSelected,
  onStatusChange,
  responsibleSelected,
  onResponsibleChange,
  prioritySelected,
  onPriorityChange,
}: ProjectsBranchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusColumnFilter
        variant="project"
        appearance="chip"
        selected={statusSelected}
        onChange={onStatusChange}
      />
      <ResponsibleColumnFilter
        appearance="chip"
        selected={responsibleSelected}
        onChange={onResponsibleChange}
      />
      <PriorityColumnFilter
        appearance="chip"
        selected={prioritySelected}
        onChange={onPriorityChange}
      />
    </div>
  )
}
