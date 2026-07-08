import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TASK_KEY } from "@/features/tasks/lib/task-keys"
import { createNote } from "@/features/shared/actions/note.api"
import { toast } from "sonner"

type AddNotesFormProps = {
    taskId: number
}

export default function AddNotesForm({ taskId }: AddNotesFormProps) {
    const [content, setContent] = useState("")
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: () => createNote({ content, task_id: taskId }),
        onSuccess: () => {
            setContent("")
            queryClient.invalidateQueries({ queryKey: TASK_KEY(String(taskId)) })
        },
        onError: (error) => {
            toast.error((error as Error).message)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        mutate()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe una nota..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card text-foreground p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
            />
            <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="w-full px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isPending ? "Agregando..." : "Agregar nota"}
            </button>
        </form>
    )
}
