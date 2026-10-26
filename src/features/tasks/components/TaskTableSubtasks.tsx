import { useQuery } from "@tanstack/react-query"
import { TASK_CHILDREN_KEY } from "@/features/tasks/lib/task-keys"
import { getTaskChildren } from "@/features/tasks/actions/task.api"
import { filterByStatus } from "@/features/tasks/lib/task-status-filter"
import SubtaskRow from "./SubtaskRow"
import TaskAddBar from "./TaskAddBar"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import PageSpinner from "@/components/ui/PageSpinner"

type TaskTableSubtasksProps = {
    taskId: number
    projectId: string
    canEdit: boolean
    canImport?: boolean
    depth?: number
    projectStartDate?: string | null
    projectDueDate?: string | null
    visibleTaskIds: ReadonlySet<number>
    dimmedTaskIds: ReadonlySet<number>
}

export default function TaskTableSubtasks({
    taskId,
    projectId,
    canEdit,
    canImport = false,
    depth = 0,
    projectStartDate,
    projectDueDate,
    visibleTaskIds,
    dimmedTaskIds,
}: TaskTableSubtasksProps) {
    const projectIdNum = Number(projectId)

    const { data: children = [], isLoading } = useQuery({
        queryKey: TASK_CHILDREN_KEY(taskId),
        queryFn: () => getTaskChildren(taskId),
        staleTime: 30000,
    })

    const padLeft = `${depth * 24}px`

    if (isLoading) {
        return <div className="px-4 py-6 flex items-center justify-center" style={{ paddingLeft: padLeft }}><PageSpinner fullPage={false} centered={false} size={12} /></div>
    }

    return (
        <Table className="table-fixed">
          <colgroup>
            {COL_GROUP.map((c, i) => (
              <col key={i} style={{ width: c.width }} />
            ))}
          </colgroup>
            <TableBody>
                {filterByStatus(children, visibleTaskIds).map((child) => (
                    <SubtaskRow
                        key={child.id_task}
                        subtask={child}
                        projectId={projectId}
                        canEdit={canEdit}
                        canImport={canImport}
                        depth={depth}
                        projectStartDate={projectStartDate}
                        projectDueDate={projectDueDate}
                        visibleTaskIds={visibleTaskIds}
                        dimmedTaskIds={dimmedTaskIds}
                    />
                ))}

                {canEdit && (
                    <TableRow>
                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: padLeft }}>
                            <TaskAddBar projectId={projectIdNum} parentTaskId={taskId} canImport={canImport} />
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
