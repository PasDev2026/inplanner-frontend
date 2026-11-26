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
import { Select } from '@/components/ui/select'
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import type {
  PaymentMethodCatalog,
  PaymentOriginMode,
} from '../lib/types'

const ORIGIN_MODE_LABELS: Record<PaymentOriginMode, string> = {
  NO: 'No lleva origen',
  OPCIONAL: 'Opcional',
  OBLIGATORIO: 'Obligatorio',
}

export default function PaymentMethodDialog({
  open,
  onOpenChange,
  method,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  method: PaymentMethodCatalog | null
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [origenModo, setOrigenModo] = useState<PaymentOriginMode>('NO')
  const [requiereSustento, setRequiereSustento] = useState(true)
  const [activo, setActivo] = useState(true)
  const [orden, setOrden] = useState('0')
  const { createPaymentMethodMutation, updatePaymentMethodMutation } =
    useMobilityMutations()

  useEffect(() => {
    if (!open) return
    setCodigo(method?.codigo ?? '')
    setNombre(method?.nombre ?? '')
    setOrigenModo(method?.origen_modo ?? 'NO')
    setRequiereSustento(method?.requiere_sustento ?? true)
    setActivo(method?.activo ?? true)
    setOrden(String(method?.orden ?? 0))
  }, [open, method])

  const submit = async () => {
    if (!codigo.trim() || !nombre.trim()) {
      toast.error('Completa el código y el nombre')
      return
    }

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      origen_modo: origenModo,
      requiere_sustento: requiereSustento,
      activo,
      orden: Number(orden) || 0,
    }

    try {
      if (method) {
        await updatePaymentMethodMutation.mutateAsync({
          id: method.id_method,
          payload,
        })
      } else {
        await createPaymentMethodMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const isPending =
    createPaymentMethodMutation.isPending ||
    updatePaymentMethodMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {method ? 'Editar método de pago' : 'Nuevo método de pago'}
          </DialogTitle>
          <DialogDescription>
            Define cómo se entrega el dinero y si requiere origen o documento
            de abono.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-method-code" className="text-xs font-medium">
                Código
              </Label>
              <Input
                id="payment-method-code"
                value={codigo}
                maxLength={30}
                onChange={(event) =>
                  setCodigo(
                    event.target.value
                      .replace(/[^a-zA-Z0-9_]/g, '')
                      .toUpperCase(),
                  )
                }
                placeholder="TRANSFERENCIA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-method-order" className="text-xs font-medium">
                Orden
              </Label>
              <Input
                id="payment-method-order"
                type="number"
                min={0}
                value={orden}
                onChange={(event) => setOrden(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-method-name" className="text-xs font-medium">
              Nombre
            </Label>
            <Input
              id="payment-method-name"
              value={nombre}
              maxLength={100}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Transferencia bancaria"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Origen del abono</Label>
            <Select
              value={origenModo}
              onValueChange={(value) => {
                if (
                  value === 'NO' ||
                  value === 'OPCIONAL' ||
                  value === 'OBLIGATORIO'
                ) {
                  setOrigenModo(value)
                }
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Seleccionar">
                  {ORIGIN_MODE_LABELS[origenModo]}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="NO">No lleva origen</Select.Item>
                  <Select.Item value="OPCIONAL">Opcional</Select.Item>
                  <Select.Item value="OBLIGATORIO">Obligatorio</Select.Item>
                </Select.List>
              </Select.Popup>
            </Select>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border"
              checked={requiereSustento}
              onChange={(event) => setRequiereSustento(event.target.checked)}
            />
            <span>
              Requiere documento de abono
              <span className="block text-xs text-muted-foreground">
                Exige adjuntar el comprobante al registrar el pago.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
            />
            Método activo
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
