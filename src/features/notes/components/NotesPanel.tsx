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
  const sortedNotes = [...notes].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          Sin notas aún
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {sortedNotes.map((note) => (
            <NoteDetail key={note.id_note} note={note} taskId={taskId} />
          ))}
        </div>
      )}
    </div>
  )
}
