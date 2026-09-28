import { useRef, useState, type DragEvent } from "react"
import { AlertTriangle, Download, FileCheck2, Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/features/shared/lib/utils"
import { downloadImportTemplate } from "../actions/import.api"

const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"]

type ImportActivitiesDropzoneProps = {
  parseando: boolean
  fileName: string | null
  archivoError: string | null
  onSelect: (file: File) => void
}

export default function ImportActivitiesDropzone({
  parseando,
  fileName,
  archivoError,
  onSelect,
}: ImportActivitiesDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function abrirExplorador() {
    inputRef.current?.click()
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) onSelect(file)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadImportTemplate()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={abrirExplorador}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            abrirExplorador()
          }
        }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging
            ? "border-brand-primary bg-brand-primary/5"
            : "border-border hover:border-brand-primary/60 hover:bg-muted/40",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          {parseando ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : fileName ? (
            <FileCheck2 className="h-5 w-5" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </span>

        {fileName ? (
          <>
            <p className="text-sm font-medium break-all">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {parseando ? "Analizando archivo..." : "Haz clic para cambiar el archivo"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">
              Arrastra tu archivo aquí o haz clic para buscarlo
            </p>
            <p className="text-xs text-muted-foreground">
              Formato .xlsx o .csv · hoja &quot;Actividades&quot;
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelect(file)
            e.target.value = ""
          }}
        />
      </div>

      {archivoError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          {archivoError}
        </p>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-1 self-start text-xs text-brand-primary transition-colors hover:text-brand-dark disabled:opacity-60"
      >
        {isDownloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Descargar plantilla
      </button>
    </div>
  )
}
