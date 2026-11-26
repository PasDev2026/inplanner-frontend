import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import PageSpinner from '@/components/ui/PageSpinner'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useMobilityAccess } from '../hooks/useMobilityAccess'
import { useCompanies, useTransferRequests } from '../hooks/useMobilityQueries'
import {
  TRANSFER_STATUS_LABELS,
} from '../lib/format'
import type { TransferScope, TransferStatus } from '../lib/types'
import TransferRequestTable from '../components/TransferRequestTable'

const PAGE_SIZE = 20

export default function MobilityListPage() {
  const { data: access, isLoading: accessLoading } = useMobilityAccess()
  const [scope, setScope] = useState<TransferScope>('mine')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TransferStatus | ''>('')
  const [companyId, setCompanyId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const { data: companies = [] } = useCompanies(false)

  const { data, isLoading, isFetching, isError, error } = useTransferRequests({
    scope,
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
    company_id: companyId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    search: search || undefined,
  })

  const tabs = useMemo(() => {
    const items: Array<{ value: TransferScope; label: string; count?: number }> = [
      { value: 'mine', label: 'Mis solicitudes' },
    ]
    if (
      access?.roles.es_jefatura ||
      access?.roles.es_super_admin ||
      (access?.aprobaciones_pendientes ?? 0) > 0
    ) {
      items.push({
        value: 'approvals',
        label: 'Mi equipo',
        count: access?.aprobaciones_pendientes,
      })
    }
    if (access?.roles.es_finanzas) {
      items.push({ value: 'finance', label: 'Finanzas' })
    }
    if (access?.roles.es_super_admin) {
      items.push({ value: 'all', label: 'Todas' })
    }
    return items
  }, [access])

  const changeScope = (next: TransferScope) => {
    setScope(next)
    setPage(1)
  }

  const applySearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  if (accessLoading) {
    return (
      <div className="flex justify-center py-20">
        <PageSpinner fullPage={false} centered={false} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Movilidad</h1>
          <p className="text-sm text-muted-foreground">
            Solicitudes de traslado, aprobaciones y control de pagos.
          </p>
        </div>
        <div className="flex gap-2">
          {access?.roles.es_super_admin && (
            <Link
              to="/movilidad/configuracion"
              className={buttonVariants({ variant: 'outline' })}
            >
              Configuración
            </Link>
          )}
          {access?.puede_crear && (
            <Link
              to="/movilidad/nueva"
              className={buttonVariants({ variant: 'default' })}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva solicitud
            </Link>
          )}
        </div>
      </div>

      {!access?.puede_crear && access?.motivo_no_puede_crear && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          {access.motivo_no_puede_crear}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant={scope === tab.value ? 'default' : 'outline'}
            size="sm"
            className="rounded-full px-4"
            onClick={() => changeScope(tab.value)}
          >
            {tab.label}
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-2 border-b border-border p-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por solicitante, empresa o motivo"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applySearch()
              }}
            />
          </div>

          <div className="w-44">
            <Select
              value={status || '__all__'}
              onValueChange={(value) => {
                if (!value) return
                setStatus(value === '__all__' ? '' : (value as TransferStatus))
                setPage(1)
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Estado">
                  {status
                    ? TRANSFER_STATUS_LABELS[status]
                    : 'Todos los estados'}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="__all__">Todos los estados</Select.Item>
                  {Object.entries(TRANSFER_STATUS_LABELS).map(
                    ([value, label]) => (
                      <Select.Item key={value} value={value}>
                        {label}
                      </Select.Item>
                    ),
                  )}
                </Select.List>
              </Select.Popup>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={companyId || '__all__'}
              onValueChange={(value) => {
                if (!value) return
                setCompanyId(value === '__all__' ? '' : value)
                setPage(1)
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Empresa">
                  {companyId
                    ? companies.find(
                        (company) => company.id_company === companyId,
                      )?.nombre
                    : 'Todas las empresas'}
                </Select.Value>
              </Select.Trigger>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="__all__">
                    Todas las empresas
                  </Select.Item>
                  {companies.map((company) => (
                    <Select.Item
                      key={company.id_company}
                      value={company.id_company}
                    >
                      {company.nombre}
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select>
          </div>

          <Input
            type="date"
            className="w-36"
            value={dateFrom}
            aria-label="Fecha desde"
            title="Fecha desde"
            onChange={(event) => {
              setDateFrom(event.target.value)
              setPage(1)
            }}
          />
          <Input
            type="date"
            className="w-36"
            value={dateTo}
            aria-label="Fecha hasta"
            title="Fecha hasta"
            onChange={(event) => {
              setDateTo(event.target.value)
              setPage(1)
            }}
          />

          <Button type="button" variant="outline" onClick={applySearch}>
            Buscar
          </Button>
        </CardContent>

        {isError ? (
          <div className="p-6 text-sm text-destructive">
            {(error as Error).message}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <PageSpinner fullPage={false} centered={false} />
          </div>
        ) : !data?.data.length ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Car />
              </EmptyMedia>
              <EmptyTitle>No hay solicitudes</EmptyTitle>
              <EmptyDescription>
                {scope === 'mine'
                  ? 'Aún no has registrado solicitudes de traslado.'
                  : 'No hay solicitudes para este filtro.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <TransferRequestTable items={data.data} />
            </div>
            <Pagination
              page={page}
              total={data.meta.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="solicitudes"
            />
          </>
        )}
      </Card>
    </div>
  )
}
