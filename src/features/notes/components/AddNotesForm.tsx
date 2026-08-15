import { useState } from "react"
import { useNotes } from "@/features/notes/hooks/useNotes"
import { noteContentSchema } from "@/features/notes/schemas/note.schema"
import { noteHtmlToText, toRelativeAttachmentHtml } from "@/features/notes/lib/note-html"
import NoteEditor from "./NoteEditor"

type AddNotesFormProps = {
  taskId: number
}

export default function AddNotesForm({ taskId }: AddNotesFormProps) {
  const [content, setContent] = useState("")
  const { createNoteMutation } = useNotes(taskId)
  const textContent = noteHtmlToText(content)
  const isValid = noteContentSchema.safeParse(textContent).success

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    createNoteMutation.mutate(toRelativeAttachmentHtml(content), {
      onSuccess: () => setContent(""),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <NoteEditor value={content} onChange={setContent} placeholder="Escribe una nota..." taskId={taskId} />
      <button
        type="submit"
        disabled={createNoteMutation.isPending || !isValid}
        className="w-full px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {createNoteMutation.isPending ? "Agregando..." : "Agregar nota"}
      </button>
    </form>
  )
}
