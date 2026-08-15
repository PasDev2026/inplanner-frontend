import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, XIcon } from "lucide-react"

type ImageLightboxProps = {
  open: boolean
  src: string | null
  onClose: () => void
}

export default function ImageLightbox({ open, src, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !src) return null

  const downloadUrl = `${src}${src.includes("?") ? "&" : "?"}dl=1`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa de imagen"
      onClick={onClose}
      className="group fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90"
    >
      <img
        src={src}
        alt="Vista previa de imagen"
        onClick={(e) => e.stopPropagation()}
        className="max-h-screen max-w-screen object-contain select-none"
      />
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="secondary" render={<a href={downloadUrl} onClick={(e) => e.stopPropagation()} />}>
          <DownloadIcon />
          Descargar
        </Button>
        <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); onClose() }}>
          <XIcon />
        </Button>
      </div>
    </div>
  )
}
