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
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatBytes } from '../lib/format'
import { usePaymentMethods, usePaymentSources } from '../hooks/useMobilityQueries'
import { useMobilityMutations } from '../hooks/useMobilityMutations'

export default function PaymentDialog({
  open,
  onOpenChange,
  requestId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
}) {
  const [methodCode, setMethodCode] = useState('')
  const [originCode, setOriginCode] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const { paymentMutation } = useMobilityMutations()

  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods(
    false,
    open,
  )
  const { data: sources = [] } = usePaymentSources(false, open)

  const selectedMethod = methods.find((method) => method.codigo === methodCode)
  const selectedSource = sources.find((source) => source.codigo === originCode)
  const origenModo = selectedMethod?.origen_modo ?? 'NO'
  const showSource = origenModo !== 'NO'
  const sourceRequired = origenModo === 'OBLIGATORIO'
  const requiresEvidence = selectedMethod?.requiere_sustento ?? false

  useEffect(() => {
    if (!open) return
    setMethodCode('')
    setOriginCode('')
    setFiles([])
  }, [open])

  useEffect(() => {
    if (!open || methodCode || methods.length === 0) return
    const preferred =
      methods.find((method) => method.codigo === 'TRANSFERENCIA') ??
      methods[0]
    setMethodCode(preferred.codigo)
  }, [open, methodCode, methods])

  const handleMethodChange = (value: string) => {
    if (!value) return
    const next = methods.find((method) => method.codigo === value)
    setMethodCode(value)
    setOriginCode('')
    if (!next?.requiere_sustento) {
      setFiles([])
    }
  }

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    setFiles((current) => [...current, ...selected])
    event.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (!selectedMethod) {
      toast.error('Selecciona un método de pago')
      return
    }
    if (sourceRequired && !originCode) {
      toast.error('Selecciona el origen del abono')
      return
    }
    if (requiresEvidence && files.length === 0) {
      toast.error('Adjunta el documento de abono')
      return
    }

    try {
      await paymentMutation.mutateAsync({
        id: requestId,
        method: selectedMethod.codigo,
        origin: showSource && originCode ? originCode : undefined,
        files: requiresEvidence ? files : [],
      })
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            El pago cierra la solicitud. Verifica el monto final y adjunta el
            documento de abono cuando corresponda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Método de abono</Label>
            <Select
              value={methodCode}
              onValueChange={(value) => {
                if (value) handleMethodChange(value)
              }}
              disabled={methodsLoading || methods.length === 0}
            >
              <Select.Trigger>
                <Select.Value placeholder="Seleccionar método">
                  {selectedMethod?.nombre}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  {methods.map((method) => (
                    <Select.Item key={method.codigo} value={method.codigo}>
                      {method.nombre}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>
            {!methodsLoading && methods.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay métodos de pago activos. Configúralos en Movilidad →
                Configuración → Pagos.
              </p>
            )}
          </div>

          {showSource && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Origen del abono {sourceRequired ? '' : '(opcional)'}
              </Label>
              <Select
                value={originCode}
                onValueChange={(value) => setOriginCode(value ?? '')}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Seleccionar origen">
                    {selectedSource?.nombre}
                  </Select.Value>
                </Select.Trigger>
                <Select.Popup>
                  <Select.List>
                    {sources.map((source) => (
                      <Select.Item key={source.codigo} value={source.codigo}>
                        {source.nombre}
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select>
            </div>
          )}

          {requiresEvidence ? (
            <div className="space-y-2">
              <Label htmlFor="payment-files" className="text-xs font-medium">
                Documento de abono (JPG, PNG, WEBP o PDF)
              </Label>
              <label
                htmlFor="payment-files"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <Paperclip className="h-4 w-4" />
                Seleccionar archivos
              </label>
              <input
                id="payment-files"
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
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Este método de pago no requiere documento de abono.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paymentMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={paymentMutation.isPending || !selectedMethod}
          >
            {paymentMutation.isPending ? 'Registrando...' : 'Registrar pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
