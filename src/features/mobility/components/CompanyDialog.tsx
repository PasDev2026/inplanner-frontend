import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
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
import { lookupRuc } from '../actions/mobility.api'
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import type { MobilityCompanySummary } from '../lib/types'

export default function CompanyDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: MobilityCompanySummary | null
}) {
  const [nombre, setNombre] = useState('')
  const [ruc, setRuc] = useState('')
  const [activo, setActivo] = useState(true)
  const [lookingUp, setLookingUp] = useState(false)
  const { createCompanyMutation, updateCompanyMutation } =
    useMobilityMutations()

  useEffect(() => {
    if (open) {
      setNombre(company?.nombre ?? '')
      setRuc(company?.ruc ?? '')
      setActivo(company?.activo ?? true)
    }
  }, [open, company])

  const searchSunat = async () => {
    if (!/^(10|15|17|20)\d{9}$/.test(ruc)) {
      toast.error('Ingresa un RUC válido de 11 dígitos')
      return
    }
    setLookingUp(true)
    try {
      const result = await lookupRuc(ruc)
      setNombre(result.razon_social)
      toast.success('Razón social obtenida de SUNAT')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLookingUp(false)
    }
  }

  const submit = async () => {
    if (!nombre.trim()) {
      toast.error('Ingresa el nombre de la empresa')
      return
    }

    const payload = {
      nombre: nombre.trim(),
      ruc: ruc.trim() || null,
      activo,
    }

    try {
      if (company) {
        await updateCompanyMutation.mutateAsync({
          id: company.id_company,
          payload,
        })
      } else {
        await createCompanyMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const isPending =
    createCompanyMutation.isPending || updateCompanyMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar empresa' : 'Nueva empresa'}
          </DialogTitle>
          <DialogDescription>
            Puedes consultar la razón social en SUNAT a partir del RUC o
            escribirla manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="company-ruc" className="text-xs font-medium">
              RUC (opcional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="company-ruc"
                value={ruc}
                maxLength={11}
                onChange={(event) =>
                  setRuc(event.target.value.replace(/\D/g, ''))
                }
                placeholder="20601234567"
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchSunat}
                disabled={lookingUp}
              >
                <Search className="mr-1 h-3.5 w-3.5" />
                {lookingUp ? 'Buscando...' : 'SUNAT'}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-name" className="text-xs font-medium">
              Razón social
            </Label>
            <Input
              id="company-name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Insalud Hub S.A.C."
              maxLength={150}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={(event) => setActivo(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Empresa activa
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
