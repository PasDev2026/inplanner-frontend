import type { BackendNote } from "@/features/shared/lib/types"
import { formatDateTime } from "@/features/shared/lib/format-date"
import { useNotes } from "@/features/notes/hooks/useNotes"
import {
  sanitizeNoteHtml,
  toRelativeAttachmentHtml,
  noteHtmlToText,
} from "@/features/notes/lib/note-html"
import ImageLightbox from "@/features/notes/components/ImageLightbox"
import NoteEditor from "@/features/notes/components/NoteEditor"
import { noteContentSchema } from "@/features/notes/schemas/note.schema"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

type NoteDetailProps = {
  note: BackendNote
  taskId: number
}

export default function NoteDetail({ note, taskId }: NoteDetailProps) {
  const { updateNoteMutation, deleteNoteMutation } = useNotes(taskId)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const startEdit = () => {
    setEditContent(sanitizeNoteHtml(note.content))
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!noteContentSchema.safeParse(noteHtmlToText(editContent)).success) return
    updateNoteMutation.mutate(
      { noteId: note.id_note, content: toRelativeAttachmentHtml(editContent) },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => {
          toast.error("Error al actualizar la nota", { position: "bottom-right" })
        },
      },
    )
  }

  const handleDelete = () => {
    toast("¿Eliminar esta nota?", {
      position: "bottom-right",
      duration: Infinity,
      action: {
        label: "Eliminar",
        onClick: () => {
          deleteNoteMutation.mutate(note.id_note, {
            onSuccess: () => {
              toast.success("Nota eliminada", { position: "bottom-right" })
            },
            onError: () => {
              toast.error("Error al eliminar la nota", { position: "bottom-right" })
            },
          })
        },
      },
      cancel: "Cancelar",
    })
  }

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("a")) return
    const img = target.closest("img")
    if (img?.src) {
      event.preventDefault()
      setPreviewSrc(img.src)
    }
  }

  const initials = `${note.createdBy?.name?.[0] ?? ''}${note.createdBy?.apellido_paterno?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="group flex items-start gap-3 py-3">
      <Avatar size="sm" className="mt-0.5 ring-2 ring-background">
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">
            {note.createdBy?.name ?? `Usuario ${note.created_by_id}`}
          </span>
          <span className="text-muted-foreground">{formatDateTime(note.created_at)}</span>
        </div>
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <NoteEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Escribe una nota..."
              taskId={taskId}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={
                  updateNoteMutation.isPending ||
                  !noteContentSchema.safeParse(noteHtmlToText(editContent)).success
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updateNoteMutation.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleContentClick}
            className="text-sm text-foreground break-words [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-1.5 [&_img]:cursor-zoom-in [&_a]:text-brand-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeNoteHtml(note.content) }}
          />
        )}
      </div>
      {!isEditing && (
        <>
          <button
            onClick={startEdit}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            title="Editar nota"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="shrink-0 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar nota"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
      <ImageLightbox
        open={!!previewSrc}
        src={previewSrc}
        onClose={() => setPreviewSrc(null)}
      />
    </div>
  )
}
