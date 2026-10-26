import { useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  FileCheck2,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/features/shared/lib/utils"
import { useImportTasks } from "../hooks/useImportTasks"
import type { ImportPreview } from "../actions/import.api"
import ImportActivitiesDropzone from "./ImportActivitiesDropzone"
import ImportPreviewPanel from "./ImportPreviewPanel"

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

  const handleBack = () => {
    setFile(null)
    setPreview(null)
    setArchivoError(null)
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

  const hayCambios = Boolean(
    preview && preview.creadas + preview.actualizadas > 0,
  )
  const cantidadCambios = preview ? preview.creadas + preview.actualizadas : 0
  const puedeImportar =
    Boolean(file && preview && hayCambios && preview.errores.length === 0) &&
    !previewMutation.isPending &&
    !importMutation.isPending

  const advertenciaSubtareas = Boolean(
    parentTaskId &&
      preview &&
      (preview.actualizadas > 0 || preview.omitidas > 0),
  )

  const handleImport = () => {
    if (!file || !puedeImportar) return
    importMutation.mutate(
      { file, projectId, parentTaskId },
      { onSuccess: () => close() },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && importMutation.isPending) return
        if (next) {
          onOpenChange(true)
        } else {
          close()
        }
      }}
    >
      <DialogContent
        showCloseButton={!importMutation.isPending}
        className={cn(
          preview
            ? "flex h-[92dvh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
            : "max-h-[90vh] overflow-y-auto sm:max-w-2xl",
        )}
      >
        {preview ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-6 py-4 pr-14">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-base font-semibold">
                  Vista previa de importación
                </DialogTitle>
                <DialogDescription className="truncate text-xs">
                  {file?.name ?? "Archivo seleccionado"}
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={importMutation.isPending}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </Button>
            </div>

            {advertenciaSubtareas && (
              <div className="flex items-start gap-2 border-b border-amber-500/40 bg-amber-500/5 px-6 py-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Este archivo contiene tareas existentes del proyecto. Se
                  actualizarán u omitirán aunque estés importando como
                  subtareas.
                </p>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden px-6 py-4">
              <ImportPreviewPanel preview={preview} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {hayCambios
                  ? `${cantidadCambios} ${
                      cantidadCambios === 1
                        ? "cambio por aplicar"
                        : "cambios por aplicar"
                    }`
                  : "No hay cambios por aplicar"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  disabled={importMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={!puedeImportar}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4" />
                      Aplicar cambios
                      {cantidadCambios > 0 ? ` (${cantidadCambios})` : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
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
                      Tarea, Descripcion, Nivel, Fecha inicio, Fecha vencimiento,
                      Estado, Responsable, Responsable 2, ID
                    </span>
                    . Las filas con ID se omiten si no cambiaron y se actualizan
                    si cambiaron; deja el ID vacío para crear una tarea nueva.{" "}
                    {parentTaskId
                      ? "Las filas nuevas se crearán como subtareas de esta tarea."
                      : "Las filas nuevas se crearán en este proyecto."}
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
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
