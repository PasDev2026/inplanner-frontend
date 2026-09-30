import { useRef, useState, type KeyboardEvent } from "react"
import { cn } from "@/features/shared/lib/utils"

type EditableNameProps = {
  value: string
  onNavigate?: () => void
  onRename: (value: string) => void
  className?: string
  inputClassName?: string
}

export default function EditableName({
  value,
  onNavigate,
  onRename,
  className,
  inputClassName,
}: EditableNameProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    if (!onNavigate) return
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      return
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null
      onNavigate()
    }, 250)
  }

  const handleDoubleClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    const next = draft.trim()
    setEditing(false)
    if (next && next !== value) onRename(next)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit()
    if (event.key === "Escape") setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setEditing(false)}
        autoFocus
        className={cn(
          "min-w-0 rounded border border-brand-primary bg-[var(--input-bg)] px-2 py-0.5 text-sm text-foreground focus:outline-none",
          inputClassName,
        )}
      />
    )
  }

  return (
    <span
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn("truncate", onNavigate && "cursor-pointer hover:underline", className)}
      title={value}
    >
      {value}
    </span>
  )
}
