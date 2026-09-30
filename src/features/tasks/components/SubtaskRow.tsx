import { useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getTaskChildren } from "@/features/tasks/actions/task.api"
import type { BackendTask } from "@/features/shared/lib/types"
import { filterByStatus } from "@/features/tasks/lib/task-status-filter"
import { TASK_CHILDREN_KEY } from "@/features/tasks/lib/task-keys"
import { useTaskMutations } from "../hooks/useTaskMutations"
import { TaskRowDnd, TaskDragHandle } from "./TaskRowDnd"
import TaskStatusPopover from "./TaskStatusPopover"
import ResponsiblePopover from "@/features/shared/components/ResponsiblePopover"
import PriorityPopover from "@/features/shared/components/PriorityPopover"
import TaskDateCellPopover from "./TaskDateCellPopover"
import { ChevronRight, ChevronDown, Trash2, MessageSquare, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import { useExpandState } from "@/features/shared/providers/ExpandStateProvider"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import { cn } from "@/features/shared/lib/utils"
import PageSpinner from "@/components/ui/PageSpinner"
import SaveAsTemplateDialog from "@/features/templates/components/SaveAsTemplateDialog"
import TaskAddBar from "./TaskAddBar"

type SubtaskRowProps = {
    subtask: BackendTask
    projectId: string
    canEdit: boolean
    depth: number
    projectStartDate?: string | null
    projectDueDate?: string | null
    visibleTaskIds: ReadonlySet<number>
    dimmedTaskIds: ReadonlySet<number>
}

export default function SubtaskRow({
    subtask,
    projectId,
    canEdit,
    depth,
    projectStartDate,
    projectDueDate,
    visibleTaskIds,
    dimmedTaskIds,
}: SubtaskRowProps) {
    const { expandedTasks, toggleTask } = useExpandState()
    const expanded = expandedTasks.has(subtask.id_task)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState("")
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const projectIdNum = Number(projectId)

    const { data: children = [], isLoading } = useQuery({
        queryKey: TASK_CHILDREN_KEY(subtask.id_task),
        queryFn: () => getTaskChildren(subtask.id_task),
        enabled: expanded,
        staleTime: 30000,
    })

    const visibleChildren = filterByStatus(children, visibleTaskIds)

    const { statusMutation, priorityMutation, renameMutation, assignmentMutation, deleteTaskMutation } = useTaskMutations(projectIdNum)

    const handleDelete = () => {
        toast("¿Eliminar subtarea?", {
            description: "Esta acción eliminará la subtarea y todas sus subtareas hijas",
            action: {
                label: "Eliminar",
                onClick: () => deleteTaskMutation.mutate(subtask.id_task),
            },
        })
    }

    const handleNameClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
            return
        }
        clickTimer.current = setTimeout(() => {
            clickTimer.current = null
            navigate(location.pathname + `?viewTask=${subtask.id_task}`)
        }, 250)
    }

    const handleNameDoubleClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
        }
        setEditValue(subtask.task_name)
        setIsEditing(true)
    }

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && editValue.trim()) {
            renameMutation.mutate({
                taskId: subtask.id_task,
                task_name: editValue.trim(),
                task_description: subtask.task_description ?? "",
            })
            setIsEditing(false)
            setEditValue("")
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            setEditValue("")
        }
    }

    const rowPad = `${depth * 24}px`
    const childPad = `${(depth + 1) * 24}px`

    return (
        <>
            <TaskRowDnd
                task={subtask}
                canEdit={canEdit}
                className={cn(
                    "hover:bg-muted transition-colors group",
                    dimmedTaskIds.has(subtask.id_task) && "opacity-40",
                )}
                expandedContent={
                    expanded ? (
                        <TableRow>
                            <TableCell colSpan={9} className="p-0">
                                <Table className="table-fixed">
                                    <colgroup>
                                        {COL_GROUP.map((c, i) => (
                                            <col key={i} style={{ width: c.width }} />
                                        ))}
                                    </colgroup>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-6">
                                                    <div className="flex justify-center">
                                                        <PageSpinner fullPage={false} centered={false} size={12} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <>
                                                {visibleChildren.map((child: BackendTask) => (
                                                    <SubtaskRow
                                                        key={child.id_task}
                                                        subtask={child}
                                                        projectId={projectId}
                                                        canEdit={canEdit}
                                                        depth={depth + 1}
                                                        projectStartDate={projectStartDate}
                                                        projectDueDate={projectDueDate}
                                                        visibleTaskIds={visibleTaskIds}
                                                        dimmedTaskIds={dimmedTaskIds}
                                                    />
                                                ))}

                                                {canEdit && (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: childPad }}>
                                                            <TaskAddBar projectId={projectIdNum} parentTaskId={subtask.id_task} />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableCell>
                        </TableRow>
                    ) : null
                }
            >
                {(dnd) => (
                    <>
                        <TableCell colSpan={2}>
                            <div className="flex items-center gap-2" style={{ paddingLeft: rowPad }}>
                                {canEdit && <TaskDragHandle {...dnd} />}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleTask(subtask.id_task) }}
                                    className={`p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-all flex-shrink-0 ${(subtask.subtasks_count ?? 0) > 0 || expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                >
                                    {expanded ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </button>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={handleEditKeyDown}
                                        onBlur={() => {
                                            setIsEditing(false)
                                            setEditValue("")
                                        }}
                                        autoFocus
                                        className="flex-1 text-sm text-foreground bg-[var(--input-bg)] border border-brand-primary rounded px-2 py-0.5 focus:outline-none min-w-0"
                                    />
                                ) : (
                                    <span
                                        onClick={handleNameClick}
                                        onDoubleClick={handleNameDoubleClick}
                                        className="text-sm text-foreground truncate cursor-pointer hover:text-brand-primary hover:underline"
                                    >
                                        {subtask.task_name}
                                    </span>
                                )}
                                {!!subtask.notes?.length && (
                                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                )}
                            </div>
                        </TableCell>
                        <TableCell />
                        <TableCell>
                            <TaskStatusPopover
                                status={subtask.status}
                                onSelect={(s) => statusMutation.mutate(
                                    { taskId: subtask.id_task, status: s },
                                    { onSuccess: () => {
                                        if (subtask.parent_task_id) {
                                            queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(subtask.parent_task_id) })
                                        }
                                    }}
                                )}
                                isPending={statusMutation.isPending}
                            />
                        </TableCell>
                        <TableCell>
                            <ResponsiblePopover
                                projectId={projectIdNum}
                                assignedTo={subtask.assignments?.map((a) => ({ user_id: a.user_id })) ?? []}
                                onAssign={(userIds) => {
                                    const currentIds = subtask.assignments?.map((a) => a.user_id) ?? []
                                    assignmentMutation.mutate(
                                        { taskId: subtask.id_task, userIds, currentIds },
                                        {
                                            onSuccess: () => {
                                                if (subtask.parent_task_id) {
                                                    queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_KEY(subtask.parent_task_id) })
                                                }
                                            }
                                        }
                                    )
                                }}
                                isPending={assignmentMutation.isPending}
                            />
                        </TableCell>
                        <TableCell>
                            <PriorityPopover
                                priority={subtask.priority}
                                onSelect={(p) => priorityMutation.mutate({ taskId: subtask.id_task, priority: p })}
                                isPending={priorityMutation.isPending}
                            />
                        </TableCell>
                        <TableCell>
                            <TaskDateCellPopover
                                projectId={projectId}
                                taskId={subtask.id_task}
                                startDate={subtask.start_date}
                                dueDate={subtask.due_date}
                                projectStartDate={projectStartDate}
                                projectDueDate={projectDueDate}
                            />
                        </TableCell>
                        <TableCell />
                        <TableCell>
                            <div className="flex items-center gap-0.5">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSaveTemplateOpen(true)
                                    }}
                                    className="p-1 text-muted-foreground hover:text-brand-primary rounded hover:bg-brand-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Guardar como plantilla"
                                >
                                    <LayoutTemplate className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete()
                                    }}
                                    className="p-1 text-destructive hover:text-destructive/80 rounded hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Eliminar subtarea"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </TableCell>
                    </>
                )}
            </TaskRowDnd>

            {saveTemplateOpen && (
                <SaveAsTemplateDialog
                    open
                    onOpenChange={setSaveTemplateOpen}
                    taskId={subtask.id_task}
                />
            )}
        </>
    )
}
