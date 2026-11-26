import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import PageSpinner from '@/components/ui/PageSpinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AVAILABLE_USERS_KEY } from '@/features/shared/lib/shared-keys'
import { getAvailableUsers } from '@/features/shared/actions/users.api'
import { useMobilityAccess } from '../hooks/useMobilityAccess'
import {
  useCompanies,
  useLocations,
  useMobilityUsers,
  usePaymentMethods,
  usePaymentSources,
} from '../hooks/useMobilityQueries'
import type {
  MobilityCompanySummary,
  MobilityLocationSummary,
  MobilityRole,
  MobilityUserAdmin,
  PaymentMethodCatalog,
  PaymentOriginMode,
  PaymentSourceCatalog,
} from '../lib/types'
import CompanyDialog from '../components/CompanyDialog'
import LocationDialog from '../components/LocationDialog'
import MobilityUserDialog from '../components/MobilityUserDialog'
import PaymentMethodDialog from '../components/PaymentMethodDialog'
import PaymentSourceDialog from '../components/PaymentSourceDialog'

type Tab = 'empresas' | 'ubicaciones' | 'usuarios' | 'pagos'

const ROLE_LABELS: Record<MobilityRole, string> = {
  FINANZAS: 'Finanzas',
}

const ORIGIN_MODE_LABELS: Record<PaymentOriginMode, string> = {
  NO: 'No lleva',
  OPCIONAL: 'Opcional',
  OBLIGATORIO: 'Obligatorio',
}

export default function MobilitySettingsPage() {
  const { data: access, isLoading: accessLoading } = useMobilityAccess()
  const [tab, setTab] = useState<Tab>('empresas')
  const [companyDialog, setCompanyDialog] = useState<{
    open: boolean
    company: MobilityCompanySummary | null
  }>({ open: false, company: null })
  const [locationDialog, setLocationDialog] = useState<{
    open: boolean
    location: MobilityLocationSummary | null
  }>({ open: false, location: null })
  const [userDialog, setUserDialog] = useState<{
    open: boolean
    user: MobilityUserAdmin | null
  }>({ open: false, user: null })
  const [paymentMethodDialog, setPaymentMethodDialog] = useState<{
    open: boolean
    method: PaymentMethodCatalog | null
  }>({ open: false, method: null })
  const [paymentSourceDialog, setPaymentSourceDialog] = useState<{
    open: boolean
    source: PaymentSourceCatalog | null
  }>({ open: false, source: null })
  const [userPage, setUserPage] = useState(1)
  const [userSearchInput, setUserSearchInput] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const isAdmin = access?.roles.es_super_admin

  const companiesQuery = useCompanies(true, Boolean(isAdmin))
  const locationsQuery = useLocations(true, Boolean(isAdmin))
  const usersQuery = useMobilityUsers(
    { page: userPage, limit: 20, search: userSearch || undefined },
    Boolean(isAdmin) && tab === 'usuarios',
  )
  const availableUsersQuery = useQuery({
    queryKey: AVAILABLE_USERS_KEY,
    queryFn: getAvailableUsers,
    enabled: Boolean(isAdmin) && tab === 'usuarios',
    staleTime: 5 * 60_000,
  })
  const paymentMethodsQuery = usePaymentMethods(
    true,
    Boolean(isAdmin) && tab === 'pagos',
  )
  const paymentSourcesQuery = usePaymentSources(
    true,
    Boolean(isAdmin) && tab === 'pagos',
  )

  if (accessLoading) {
    return (
      <div className="flex justify-center py-20">
        <PageSpinner fullPage={false} centered={false} />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm text-destructive">
          No tienes permisos para administrar el módulo de movilidad.
        </p>
        <Link
          to="/movilidad"
          className={buttonVariants({ variant: 'outline', className: 'mt-4' })}
        >
          Volver a movilidad
        </Link>
      </div>
    )
  }

  const companies = companiesQuery.data ?? []
  const locations = locationsQuery.data ?? []
  const users = usersQuery.data?.data ?? []
  const availableUsers = availableUsersQuery.data ?? []
  const paymentMethods = paymentMethodsQuery.data ?? []
  const paymentSources = paymentSourcesQuery.data ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Configuración de movilidad</h1>
          <p className="text-sm text-muted-foreground">
            Empresas, ubicaciones y asignaciones de jefatura, empresa y roles.
          </p>
        </div>
        <Link
          to="/movilidad"
          className={buttonVariants({ variant: 'outline' })}
        >
          Volver a movilidad
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'empresas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('empresas')}
        >
          <Building2 className="mr-1.5 h-3.5 w-3.5" />
          Empresas
        </Button>
        <Button
          type="button"
          variant={tab === 'ubicaciones' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('ubicaciones')}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Ubicaciones
        </Button>
        <Button
          type="button"
          variant={tab === 'usuarios' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('usuarios')}
        >
          <Users className="mr-1.5 h-3.5 w-3.5" />
          Usuarios
        </Button>
        <Button
          type="button"
          variant={tab === 'pagos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('pagos')}
        >
          <Wallet className="mr-1.5 h-3.5 w-3.5" />
          Pagos
        </Button>
      </div>

      {tab === 'empresas' && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setCompanyDialog({ open: true, company: null })}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva empresa
              </Button>
            </div>

            {companiesQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <PageSpinner fullPage={false} centered={false} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id_company}>
                      <TableCell className="font-medium">
                        {company.nombre}
                      </TableCell>
                      <TableCell>{company.ruc ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            company.activo
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }
                        >
                          {company.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            setCompanyDialog({ open: true, company })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'ubicaciones' && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() =>
                  setLocationDialog({ open: true, location: null })
                }
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva ubicación
              </Button>
            </div>

            {locationsQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <PageSpinner fullPage={false} centered={false} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id_location}>
                      <TableCell className="font-medium">
                        {location.nombre}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {location.direccion ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            location.activo
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }
                        >
                          {location.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            setLocationDialog({ open: true, location })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'usuarios' && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="relative min-w-56 flex-1">
                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nombre, documento o email"
                  value={userSearchInput}
                  onChange={(event) => setUserSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setUserSearch(userSearchInput.trim())
                      setUserPage(1)
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUserSearch(userSearchInput.trim())
                  setUserPage(1)
                }}
              >
                Buscar
              </Button>
            </div>

            {usersQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <PageSpinner fullPage={false} centered={false} />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Jefatura</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id_user}>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {[user.name, user.apellido_paterno]
                              .filter(Boolean)
                              .join(' ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email ?? '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.numero_documento}
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.company?.nombre ?? '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.jefe?.nombre_completo ?? '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {ROLE_LABELS[role]}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setUserDialog({ open: true, user })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {usersQuery.data && (
                  <Pagination
                    page={userPage}
                    total={usersQuery.data.meta.total}
                    pageSize={20}
                    onPageChange={setUserPage}
                    label="usuarios"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'pagos' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Métodos de pago</h2>
                  <p className="text-xs text-muted-foreground">
                    Cómo se entrega el dinero al colaborador.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    setPaymentMethodDialog({ open: true, method: null })
                  }
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nuevo método
                </Button>
              </div>

              {paymentMethodsQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <PageSpinner fullPage={false} centered={false} />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow key={method.id_method}>
                        <TableCell className="font-medium">
                          {method.nombre}
                        </TableCell>
                        <TableCell className="text-xs">
                          {method.codigo}
                        </TableCell>
                        <TableCell className="text-xs">
                          {ORIGIN_MODE_LABELS[method.origen_modo]}
                        </TableCell>
                        <TableCell className="text-xs">
                          {method.requiere_sustento ? 'Sí' : 'No'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              method.activo
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }
                          >
                            {method.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setPaymentMethodDialog({
                                open: true,
                                method,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Orígenes</h2>
                  <p className="text-xs text-muted-foreground">
                    Bancos, caja o fondos internos de donde sale el abono.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    setPaymentSourceDialog({ open: true, source: null })
                  }
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nuevo origen
                </Button>
              </div>

              {paymentSourcesQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <PageSpinner fullPage={false} centered={false} />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origen</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentSources.map((source) => (
                      <TableRow key={source.id_source}>
                        <TableCell className="font-medium">
                          {source.nombre}
                        </TableCell>
                        <TableCell className="text-xs">
                          {source.codigo}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              source.activo
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }
                          >
                            {source.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setPaymentSourceDialog({
                                open: true,
                                source,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CompanyDialog
        open={companyDialog.open}
        onOpenChange={(open) =>
          setCompanyDialog((current) => ({ ...current, open }))
        }
        company={companyDialog.company}
      />

      <LocationDialog
        open={locationDialog.open}
        onOpenChange={(open) =>
          setLocationDialog((current) => ({ ...current, open }))
        }
        location={locationDialog.location}
      />

      <MobilityUserDialog
        open={userDialog.open}
        onOpenChange={(open) =>
          setUserDialog((current) => ({ ...current, open }))
        }
        user={userDialog.user}
        companies={companies}
        availableUsers={availableUsers}
      />

      <PaymentMethodDialog
        open={paymentMethodDialog.open}
        onOpenChange={(open) =>
          setPaymentMethodDialog((current) => ({ ...current, open }))
        }
        method={paymentMethodDialog.method}
      />

      <PaymentSourceDialog
        open={paymentSourceDialog.open}
        onOpenChange={(open) =>
          setPaymentSourceDialog((current) => ({ ...current, open }))
        }
        source={paymentSourceDialog.source}
      />
    </div>
  )
}
