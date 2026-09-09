import { Spinner } from "@/components/ui/Spinner"

type TemplatePendingOverlayProps = {
  templateName: string
  action: "Aplicando" | "Guardando"
}

export default function TemplatePendingOverlay({
  templateName,
  action,
}: TemplatePendingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10"
    >
      <Spinner size="sm" />
      <span>
        {action} plantilla{" "}
        <span className="font-medium">&ldquo;{templateName}&rdquo;</span>&hellip;
      </span>
    </div>
  )
}
