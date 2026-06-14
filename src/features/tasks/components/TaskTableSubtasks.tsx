import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTaskChildren, createTask } from "@/features/shared/actions/task.api"
import { Plus, Check, X } from "lucide-react"
import { toast } from "sonner"
import SubtaskRow from "./SubtaskRow"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { COL_GROUP } from "@/features/shared/lib/tableColumns"
import Spinner from "@/components/ui/Spinner"

type TaskTableSubtasksProps = {
    taskId: number
    projectId: string
    canEdit: boolean
    depth?: number
    projectStartDate?: string | null
    projectDueDate?: string | null
    filterType?: 'project' | 'task' | null
    filterStatus?: string | null
}

export default function TaskTableSubtasks({
    taskId,
    projectId,
    canEdit,
    depth = 0,
    projectStartDate,
    projectDueDate,
    filterType,
    filterStatus,
}: TaskTableSubtasksProps) {
    const [showForm, setShowForm] = useState(false)
    const [newTaskName, setNewTaskName] = useState("")
    const queryClient = useQueryClient()
    const projectIdNum = Number(projectId)

    const { data: children = [], isLoading } = useQuery({
        queryKey: ["taskChildren", taskId],
        queryFn: () => getTaskChildren(taskId),
        staleTime: 30000,
    })

    const createSubtask = useMutation({
        mutationFn: (name: string) =>
            createTask({ task_name: name, project_id: projectIdNum, parent_task_id: taskId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["taskChildren", taskId] })
            queryClient.invalidateQueries({ queryKey: ["projectTasks", projectIdNum] })
            setNewTaskName("")
            setShowForm(false)
        },
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const padLeft = `${depth * 24}px`

    if (isLoading) {
        return <div className="px-4 py-6 flex items-center justify-center" style={{ paddingLeft: padLeft }}><Spinner fullPage={false} size={12} /></div>
    }

    return (
        <Table className="table-fixed">
          <colgroup>
            {COL_GROUP.map((c, i) => (
              <col key={i} style={{ width: c.width }} />
            ))}
          </colgroup>
            <TableBody>
                {children.map((child) => (
                    <SubtaskRow
                        key={child.id_task}
                        subtask={child}
                        projectId={projectId}
                        canEdit={canEdit}
                        depth={depth}
                        projectStartDate={projectStartDate}
                        projectDueDate={projectDueDate}
                        filterType={filterType}
                        filterStatus={filterStatus}
                    />
                ))}

                {canEdit && !showForm && (
                    <TableRow>
                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: padLeft }}>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Añadir subtarea
                            </button>
                        </TableCell>
                    </TableRow>
                )}

                {canEdit && showForm && (
                    <TableRow>
                        <TableCell colSpan={9} className="px-4 py-2" style={{ paddingLeft: padLeft }}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                    placeholder="Nombre de la subtarea"
                                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-brand-primary"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && newTaskName.trim()) {
                                            createSubtask.mutate(newTaskName.trim())
                                        }
                                        if (e.key === "Escape") {
                                            setShowForm(false)
                                            setNewTaskName("")
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newTaskName.trim()) createSubtask.mutate(newTaskName.trim())
                                    }}
                                    disabled={!newTaskName.trim() || createSubtask.isPending}
                                    className="p-1 text-brand-primary hover:text-brand-dark disabled:text-gray-300"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowForm(false)
                                        setNewTaskName("")
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
