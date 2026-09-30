import { ChevronDown, ChevronRight } from "lucide-react"

type NodeToggleProps = {
  hasChildren: boolean
  expanded: boolean
  onToggle: () => void
}

export default function NodeToggle({
  hasChildren,
  expanded,
  onToggle,
}: NodeToggleProps) {
  if (!hasChildren) {
    return <span className="h-5 w-5 shrink-0" aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      aria-label={expanded ? "Contraer rama" : "Expandir rama"}
      aria-expanded={expanded}
      className="nodrag flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {expanded ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
