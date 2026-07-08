import type { BackendNote } from "@/features/shared/lib/types"
import NoteDetail from "./NoteDetail"
import AddNotesForm from "./AddNotesForm"
import { useState } from "react"

type NotesPanelProps = {
    notes: BackendNote[]
    taskId: number
}

export function NotesPanel({ notes, taskId }: NotesPanelProps) {
    const [showForm, setShowForm] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                    Notas ({notes.length})
                </label>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showForm ? "Cancelar" : "+ Agregar"}
                </button>
            </div>

            {showForm && <AddNotesForm taskId={taskId} />}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                        Sin notas aún
                    </p>
                ) : (
                    notes.map((note) => (
                        <NoteDetail key={note.id_note} note={note} />
                    ))
                )}
            </div>
        </div>
    )
}
