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
import { Textarea } from '@/components/ui/textarea'
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import type { MobilityLocationSummary } from '../lib/types'

export default function LocationDialog({
  open,
  onOpenChange,
  location,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: MobilityLocationSummary | null
}) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [activo, setActivo] = useState(true)
  const { createLocationMutation, updateLocationMutation } =
    useMobilityMutations()

  useEffect(() => {
    if (open) {
      setNombre(location?.nombre ?? '')
      setDireccion(location?.direccion ?? '')
      setActivo(location?.activo ?? true)
    }
  }, [open, location])

  const submit = async () => {
    if (!nombre.trim()) {
      toast.error('Ingresa el nombre de la ubicación')
      return
    }

    const payload = {
      nombre: nombre.trim(),
      direccion: direccion.trim() || null,
      activo,
    }

    try {
      if (location) {
        await updateLocationMutation.mutateAsync({
          id: location.id_location,
          payload,
        })
      } else {
        await createLocationMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const isPending =
    createLocationMutation.isPending || updateLocationMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Editar ubicación' : 'Nueva ubicación'}
          </DialogTitle>
          <DialogDescription>
            Las ubicaciones se usan como origen y destino de los traslados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="location-name" className="text-xs font-medium">
              Nombre
            </Label>
            <Input
              id="location-name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Hub"
              maxLength={150}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="location-address"
              className="text-xs font-medium"
            >
              Dirección
            </Label>
            <Textarea
              id="location-address"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              placeholder="Av. Manuel Olguín 335, Santiago de Surco"
              rows={2}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Ubicación activa
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
