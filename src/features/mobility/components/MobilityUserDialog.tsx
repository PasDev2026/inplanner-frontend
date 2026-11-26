import { useEffect, useState } from 'react'
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
import SearchableUserSelect from '@/features/shared/components/SearchableUserSelect'
import type { AvailableUser } from '@/features/shared/actions/users.api'
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import type {
  MobilityCompanySummary,
  MobilityRole,
  MobilityUserAdmin,
} from '../lib/types'

export default function MobilityUserDialog({
  open,
  onOpenChange,
  user,
  companies,
  availableUsers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: MobilityUserAdmin | null
  companies: MobilityCompanySummary[]
  availableUsers: AvailableUser[]
}) {
  const [jefeId, setJefeId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [roles, setRoles] = useState<MobilityRole[]>([])
  const { assignUserMutation } = useMobilityMutations()

  useEffect(() => {
    if (open && user) {
      setJefeId(user.jefe?.id_user ?? '')
      setCompanyId(user.company?.id_company ?? '')
      setRoles(user.roles)
    }
  }, [open, user])

  const toggleRole = (role: MobilityRole) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    )
  }

  const submit = async () => {
    if (!user) return

    try {
      await assignUserMutation.mutateAsync({
        id: user.id_user,
        payload: {
          jefe_id: jefeId || null,
          company_id: companyId || null,
          roles,
        },
      })
      onOpenChange(false)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const jefeOptions = availableUsers.filter(
    (candidate) => candidate.id_user !== user?.id_user,
  )
  const selectedCompany = companies.find(
    (company) => company.id_company === companyId,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuración de movilidad</DialogTitle>
          <DialogDescription>
            {user
              ? `${user.name} ${user.apellido_paterno ?? ''}`.trim()
              : 'Usuario'}
            . Asigna su jefatura, empresa y roles del módulo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Jefatura directa</Label>
            <SearchableUserSelect
              users={jefeOptions}
              value={jefeId || null}
              onChange={(value) => setJefeId(value ?? '')}
              placeholder="Sin jefatura"
              allowNone
              noneLabel="Sin jefatura"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Empresa</Label>
            <Select
              value={companyId || '__none__'}
              onValueChange={(value) =>
                setCompanyId(value && value !== '__none__' ? value : '')
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Sin empresa">
                  {selectedCompany?.nombre ?? 'Sin empresa'}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="__none__">Sin empresa</Select.Item>
                  {companies.map((company) => (
                    <Select.Item
                      key={company.id_company}
                      value={company.id_company}
                    >
                      {company.nombre}
                      {company.activo ? '' : ' (inactiva)'}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Rol del módulo de movilidad
            </Label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border"
                checked={roles.includes('FINANZAS')}
                onChange={() => toggleRole('FINANZAS')}
              />
              <span>
                Finanzas / Controller
                <span className="block text-xs text-muted-foreground">
                  Aprueba, rechaza, registra pagos y cierra solicitudes.
                </span>
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignUserMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={assignUserMutation.isPending}
          >
            {assignUserMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
