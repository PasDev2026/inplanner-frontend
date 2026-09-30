import { History } from "lucide-react"
import { Button } from "@/components/ui/button"

type FormDraftBannerProps = {
  hasDraft: boolean
  onDiscard: () => void
}

export default function FormDraftBanner({
  hasDraft,
  onDiscard,
}: FormDraftBannerProps) {
  if (!hasDraft) return null

  return (
    <div className="flex animate-in items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning fade-in slide-in-from-top-1">
      <span className="flex items-center gap-2">
        <History className="size-4 shrink-0" />
        Recuperamos los datos que estabas registrando.
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={onDiscard}
      >
        Descartar
      </Button>
    </div>
  )
}
