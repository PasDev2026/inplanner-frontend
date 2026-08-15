import { useQuery } from "@tanstack/react-query"
import { TASK_CHILDREN_KEY } from "@/features/tasks/lib/task-keys"
import { getTaskChildren } from "@/features/tasks/actions/task.api"
import { CheckSquare } from "lucide-react"
import PageSpinner from "@/components/ui/PageSpinner"

type SubtaskChecklistProps = {
    taskId: number
}

export function SubtaskChecklist({ taskId }: SubtaskChecklistProps) {
    const { data, isLoading } = useQuery({
        queryKey: TASK_CHILDREN_KEY(taskId),
        queryFn: () => getTaskChildren(taskId),
        enabled: !!taskId,
    })

    if (isLoading) return <PageSpinner />

    const children = data ?? []

    if (children.length === 0) return null

    return (
        <div className="space-y-3">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Subtareas ({children.length})
            </label>
            <ul className="space-y-1.5">
                {children.map((child) => (
                    <li key={child.id_task} className="flex items-center gap-2.5">
                        <CheckSquare
                            className={`h-4 w-4 shrink-0 ${child.status === 4 ? "text-brand-primary" : "text-muted-foreground"}`}
                        />
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
