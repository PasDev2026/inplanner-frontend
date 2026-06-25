import { useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useUpdateTaskDates } from "../hooks/useUpdateTask"
import { toDate } from "@/features/shared/lib/format-date"
import DateRangePopover from "@/features/shared/components/DateRangePopover"

type TaskDateCellPopoverProps = {
    projectId: string
    taskId: number
    startDate?: string | null
    dueDate?: string | null
    projectStartDate?: string | null
    projectDueDate?: string | null
}

export default function TaskDateCellPopover({
    projectId: _projectId,
    taskId,
    startDate,
    dueDate,
    projectStartDate,
    projectDueDate,
}: TaskDateCellPopoverProps) {
    const { mutate, isPending } = useUpdateTaskDates()

    const projectStart = toDate(projectStartDate)
    const projectEnd = toDate(projectDueDate)

    const disabledDays = useMemo(() => {
        if (projectStart && projectEnd)
            return { before: projectStart, after: projectEnd }
        if (projectStart)
            return { before: projectStart, after: new Date(2099, 11, 31) }
        if (projectEnd)
            return { before: new Date(1970, 0, 1), after: projectEnd }
        return undefined
    }, [projectStart, projectEnd])

    const projectRangeLabel = useMemo(() => {
        if (!projectStart && !projectEnd) return undefined
        return (
            "Rango del proyecto: " +
            (projectStart ? format(projectStart, "d MMM yyyy", { locale: es }) : "—") +
            " → " +
            (projectEnd ? format(projectEnd, "d MMM yyyy", { locale: es }) : "—")
        )
    }, [projectStart, projectEnd])

    return (
        <DateRangePopover
            startDate={startDate}
            dueDate={dueDate}
            onSave={(start_date, due_date) => {
                mutate({ taskId, start_date, due_date })
            }}
            isPending={isPending}
            disabledDays={disabledDays}
            projectRangeLabel={projectRangeLabel}
        />
    )
}
