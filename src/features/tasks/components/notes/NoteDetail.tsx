import type { BackendNote } from "@/features/shared/lib/types"
import { formatDate } from "@/features/shared/lib/format-date"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteNote } from "@/features/shared/actions/note.api"
import { toast } from "sonner"

type NoteDetailProps = {
    note: BackendNote
}

export default function NoteDetail({ note }: NoteDetailProps) {
    const queryClient = useQueryClient()

    const { mutate } = useMutation({
        mutationFn: () => deleteNote(note.id_note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", String(note.task_id)] })
        },
        onError: () => {
            toast.error("Error al eliminar la nota")
        },
    })

    return (
        <div className="bg-white rounded-lg border border-slate-100 p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-700">{note.content}</p>
                <button
                    onClick={() => mutate()}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{note.createdBy?.name ?? `Usuario ${note.created_by_id}`}</span>
                <span>·</span>
                <span>{formatDate(note.created_at)}</span>
            </div>
        </div>
    )
}
