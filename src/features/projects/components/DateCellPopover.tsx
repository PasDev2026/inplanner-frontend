import { useUpdateProject } from "../hooks/useUpdateProject"
import DateRangePopover from "../../shared/components/DateRangePopover"

type DateCellPopoverProps = {
    projectId: number
    startDate?: string | null
    dueDate?: string | null
}

export default function DateCellPopover({ projectId, startDate, dueDate }: DateCellPopoverProps) {
    const updateProject = useUpdateProject()

    return (
        <DateRangePopover
            startDate={startDate}
            dueDate={dueDate}
            onSave={(start_date, due_date) => {
                updateProject.mutate({ projectId, start_date, due_date })
            }}
            isPending={updateProject.isPending}
            showDueStatus
        />
    )
}
