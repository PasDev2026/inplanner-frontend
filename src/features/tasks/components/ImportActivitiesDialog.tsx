import { useState } from "react"
import { FileSpreadsheet, FileCheck2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useImportTasks } from "../hooks/useImportTasks"
import type { ImportPreview } from "../actions/import.api"
import ImportActivitiesDropzone from "./ImportActivitiesDropzone"
import ImportActivitiesSummary from "./ImportActivitiesSummary"

const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"]

type ImportActivitiesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  parentTaskId?: number
}

export default function ImportActivitiesDialog({
  open,
  onOpenChange,
  projectId,
  parentTaskId,
}: ImportActivitiesDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [archivoError, setArchivoError] = useState<string | null>(null)
  const { previewMutation, importMutation } = useImportTasks()

  const close = () => {
    setFile(null)
    setPreview(null)
    setArchivoError(null)
    onOpenChange(false)
  }

  const handleSelect = async (selected: File) => {
    const name = selected.name.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setArchivoError("Solo se permiten archivos .xlsx o .csv")
      setFile(null)
      setPreview(null)
      return
    }

    setArchivoError(null)
    setFile(selected)
    setPreview(null)
    try {
      const result = await previewMutation.mutateAsync({
        file: selected,
        projectId,
        parentTaskId,
      })
      setPreview(result)
    } catch {
      // El toast de error lo maneja el hook.
    }
  }

  const totalFilas = preview?.filas.length ?? 0
  const puedeImportar =
    Boolean(file && preview && totalFilas > 0 && preview.errores.length === 0) &&
    !previewMutation.isPending &&
    !importMutation.isPending

  const handleImport = () => {
    if (!file || !puedeImportar) return
    importMutation.mutate(
      { file, projectId, parentTaskId },
      { onSuccess: () => close() },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <DialogTitle>Importar actividades desde Excel</DialogTitle>
              <DialogDescription>
                Columnas:{" "}
                <span className="font-medium text-foreground">
                  Tarea, Descripcion, Nivel, Estado
                </span>
                . {parentTaskId
                  ? "Se crearán como subtareas de esta tarea."
                  : "Se crearán en este proyecto."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <ImportActivitiesDropzone
            parseando={previewMutation.isPending}
            fileName={file?.name ?? null}
            archivoError={archivoError}
            onSelect={handleSelect}
          />

          {preview && <ImportActivitiesSummary preview={preview} />}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={importMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleImport} disabled={!puedeImportar}>
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <FileCheck2 className="h-4 w-4" />
                Importar {totalFilas > 0 ? `(${totalFilas})` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
