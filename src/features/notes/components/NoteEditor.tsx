import { useEffect } from "react"
import { useEditor, EditorContent, useEditorState } from "@tiptap/react"
import type { EditorView } from "@tiptap/pm/view"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { toast } from "sonner"
import { LinkCard } from "@/features/notes/lib/link-card"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react"
import { uploadImage } from "@/features/notes/actions/note.api"

type NoteEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  taskId: number
}

type ImageUploadOptions = {
  onUpload: (file: File) => Promise<string | null>
}

function uploadAndInsert(
  view: EditorView,
  file: File,
  onUpload: (f: File) => Promise<string | null>,
) {
  onUpload(file).then((src) => {
    if (!src || view.isDestroyed) return
    const node = view.state.schema.nodes.image?.create({ src })
    if (!node) return
    view.dispatch(view.state.tr.replaceSelectionWith(node))
    view.focus()
  }).catch(() => {
    toast.error("Error al subir la imagen")
  })
}

const ImageUpload = Extension.create<ImageUploadOptions>({
  name: "imageUpload",

  addOptions() {
    return { onUpload: async () => null }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imageUpload"),
        props: {
          handlePaste: (view, event) => {
            const images = Array.from(event.clipboardData?.files ?? []).filter((f) =>
              f.type.startsWith("image/"),
            )
            if (images.length === 0) return false
            images.forEach((file) => uploadAndInsert(view, file, this.options.onUpload))
            return true
          },
          handleDrop: (view, event) => {
            const images = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
              f.type.startsWith("image/"),
            )
            if (images.length === 0) return false
            images.forEach((file) => uploadAndInsert(view, file, this.options.onUpload))
            return true
          },
        },
      }),
    ]
  },
})

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

export default function NoteEditor({ value, onChange, placeholder, taskId }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full h-auto rounded-md" } }),
      Placeholder.configure({ placeholder }),
      LinkCard,
      ImageUpload.configure({
        onUpload: (file: File) => uploadImage(file, taskId),
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[6rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (!editor || value === editor.getHTML()) return
    editor.commands.setContent(value)
  }, [editor, value])

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold") ?? false,
      isItalic: editor?.isActive("italic") ?? false,
      isStrike: editor?.isActive("strike") ?? false,
      isBulletList: editor?.isActive("bulletList") ?? false,
      isOrderedList: editor?.isActive("orderedList") ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  })

  if (!editor) return null

  return (
    <div className="rounded-lg border border-border bg-card text-foreground focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors">
      <div className="flex items-center gap-0.5 border-b border-border/60 px-1.5 py-1">
        <ToolbarButton title="Negrita" active={state.isBold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Cursiva" active={state.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Tachado" active={state.isStrike} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Lista" active={state.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton title="Lista numerada" active={state.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Deshacer" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className={`size-4 ${state.canUndo ? "" : "opacity-40"}`} />
        </ToolbarButton>
        <ToolbarButton title="Rehacer" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className={`size-4 ${state.canRedo ? "" : "opacity-40"}`} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="px-3 py-2 text-sm [&_.ProseMirror>p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror>p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror>p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror>p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror>p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror]:space-y-1 [&_.ProseMirror_a]:text-brand-primary [&_.ProseMirror_a]:underline" />
      <p className="px-3 py-1 text-[10px] text-muted-foreground/70">
        Pega o arrastra imágenes · pega texto con formato
      </p>
    </div>
  )
}
