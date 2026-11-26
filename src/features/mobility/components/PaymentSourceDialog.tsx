import { useEffect, useState } from 'react'
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
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import type { PaymentSourceCatalog } from '../lib/types'

export default function PaymentSourceDialog({
  open,
  onOpenChange,
  source,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: PaymentSourceCatalog | null
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState(true)
  const [orden, setOrden] = useState('0')
  const { createPaymentSourceMutation, updatePaymentSourceMutation } =
    useMobilityMutations()

  useEffect(() => {
    if (!open) return
    setCodigo(source?.codigo ?? '')
    setNombre(source?.nombre ?? '')
    setActivo(source?.activo ?? true)
    setOrden(String(source?.orden ?? 0))
  }, [open, source])

  const submit = async () => {
    if (!codigo.trim() || !nombre.trim()) {
      toast.error('Completa el código y el nombre')
      return
    }

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      activo,
      orden: Number(orden) || 0,
    }

    try {
      if (source) {
        await updatePaymentSourceMutation.mutateAsync({
          id: source.id_source,
          payload,
        })
      } else {
        await createPaymentSourceMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const isPending =
    createPaymentSourceMutation.isPending ||
    updatePaymentSourceMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {source ? 'Editar origen de pago' : 'Nuevo origen de pago'}
          </DialogTitle>
          <DialogDescription>
            Los orígenes se usan cuando el método de pago los requiere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-source-code" className="text-xs font-medium">
                Código
              </Label>
              <Input
                id="payment-source-code"
                value={codigo}
                maxLength={30}
                onChange={(event) =>
                  setCodigo(
                    event.target.value
                      .replace(/[^a-zA-Z0-9_]/g, '')
                      .toUpperCase(),
                  )
                }
                placeholder="BCP"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-source-order" className="text-xs font-medium">
                Orden
              </Label>
              <Input
                id="payment-source-order"
                type="number"
                min={0}
                value={orden}
                onChange={(event) => setOrden(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-source-name" className="text-xs font-medium">
              Nombre
            </Label>
            <Input
              id="payment-source-name"
              value={nombre}
              maxLength={100}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Banco BCP"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
            />
            Origen activo
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
