import { useQuery } from "@tanstack/react-query"
import { getTaskChildren } from "@/features/shared/actions/task.api"
import Spinner from "../../../components/ui/Spinner"

type SubtaskChecklistProps = {
    projectId: number
    taskId: number
}

export function SubtaskChecklist({ projectId: _projectId, taskId }: SubtaskChecklistProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["taskChildren", taskId],
        queryFn: () => getTaskChildren(taskId),
        enabled: !!taskId,
    })

    if (isLoading) return <Spinner />

    const children = data ?? []

    if (children.length === 0) return null

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Subtareas ({children.length})
            </h4>
            <ul className="space-y-2">
                {children.map((child) => (
                    <li
                        key={child.id_task}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                    >
                        <span
                            className={`text-sm ${child.status === 4 ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                            {child.task_name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
