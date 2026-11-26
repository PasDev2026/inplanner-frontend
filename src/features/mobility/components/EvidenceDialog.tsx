import { useEffect, useState } from 'react'
import { Paperclip, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatAmount, formatBytes } from '../lib/format'
import { useMobilityMutations } from '../hooks/useMobilityMutations'

export default function EvidenceDialog({
  open,
  onOpenChange,
  requestId,
  estimatedAmount,
  currency,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  estimatedAmount: number
  currency: string
}) {
  const [finalAmount, setFinalAmount] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const { evidenceMutation } = useMobilityMutations()

  useEffect(() => {
    if (open) {
      setFinalAmount('')
      setFiles([])
    }
  }, [open])

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    setFiles((current) => [...current, ...selected])
    event.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index))
  }

  const submit = async () => {
    const amount = Number(finalAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Ingresa un monto final mayor que 0')
      return
    }
    if (files.length === 0) {
      toast.error('Adjunta al menos una evidencia')
      return
    }

    try {
      await evidenceMutation.mutateAsync({
        id: requestId,
        finalAmount: amount,
        files,
      })
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const parsed = Number(finalAmount)
  const exceeds =
    Number.isFinite(parsed) && parsed > 0 && parsed > estimatedAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cargar sustento del viaje</DialogTitle>
          <DialogDescription>
            Adjunta la evidencia del taxi (Yape, recibo, etc.) e indica el monto
            real del servicio. La solicitud quedará en estado Sustentado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="final-amount" className="text-xs font-medium">
              Monto final
            </Label>
            <Input
              id="final-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={finalAmount}
              onChange={(event) => setFinalAmount(event.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Monto aproximado: {formatAmount(estimatedAmount, currency)}
            </p>
            {exceeds && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                El monto final supera el aproximado. Finanzas verá la diferencia
                al registrar el pago.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence-files" className="text-xs font-medium">
              Evidencia (JPG, PNG, WEBP o PDF)
            </Label>
            <label
              htmlFor="evidence-files"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <Paperclip className="h-4 w-4" />
              Seleccionar archivos
            </label>
            <input
              id="evidence-files"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={addFiles}
            />

            {files.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={evidenceMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={evidenceMutation.isPending}
          >
            {evidenceMutation.isPending ? 'Cargando...' : 'Cargar sustento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
