import { GitBranch } from "lucide-react"

export default function DiagramEmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 text-center">
      <GitBranch className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
