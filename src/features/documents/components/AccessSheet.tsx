import { useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/features/shared/lib/utils'
import type { DocumentAccess, PermissionItem } from '../lib/types'
import { usePermissions } from '../hooks/useDocumentQueries'
import { useDocumentMutations } from '../hooks/useDocumentMutations'

const PERMISSION_OPTIONS: {
  value: PermissionItem['permission']
  label: string
}[] = [
  { value: 'VIEWER', label: 'Visor' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'NONE', label: 'Sin acceso' },
]

const PAGE_SIZE = 50

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function AccessSheet({
  open,
  onOpenChange,
  access,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  access: DocumentAccess
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePermissions({
    search,
    page,
    limit: PAGE_SIZE,
  })
  const { setPermissionMutation } = useDocumentMutations()

  useEffect(() => {
    setPage(1)
  }, [search])

  const permissions = useMemo(() => data?.data ?? [], [data])
  const summary = useMemo(() => {
    return permissions.reduce(
      (accumulator, item) => {
        if (item.permission === 'EDITOR') accumulator.editors += 1
        if (item.permission === 'VIEWER') accumulator.viewers += 1
        if (item.permission === 'NONE') accumulator.revoked += 1
        return accumulator
      },
      { editors: 0, viewers: 0, revoked: 0 },
    )
  }, [permissions])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="doc-portal border-doc-line bg-doc-paper text-doc-ink sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Users className="h-5 w-5 text-doc-accent" />
            Accesos a Documentos
          </SheetTitle>
          <SheetDescription className="text-doc-muted">
            Todos los trabajadores activos son visores por defecto. Aquí puedes
            dar edición global o revocar el acceso.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-doc-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, email o documento…"
              className="pl-8"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-doc-muted">
            <span>{data?.meta.total ?? 0} trabajadores</span>
            <span>{summary.editors} editores</span>
            <span>{summary.viewers} visores</span>
            <span>{summary.revoked} sin acceso</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-14 rounded-md bg-doc-paper-strong"
                />
              ))}
            </div>
          ) : permissions.length === 0 ? (
            <p className="py-8 text-center text-xs text-doc-muted">
              No hay trabajadores activos que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="divide-y divide-doc-line rounded-lg border border-doc-line bg-doc-paper-strong/40">
              {permissions.map((permission) => (
                <div key={permission.userId} className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-doc-accent-soft text-[11px] font-bold text-doc-accent">
                        {initials(permission.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-doc-ink">
                          {permission.name}
                        </p>
                        {permission.isDefault && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-doc-line text-[8px] uppercase tracking-[0.1em] text-doc-muted"
                          >
                            Por defecto
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-[10px] text-doc-muted">
                        {permission.email ?? 'Sin email'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-1">
                    {PERMISSION_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          permission.permission === option.value
                            ? 'default'
                            : 'outline'
                        }
                        size="xs"
                        onClick={() =>
                          setPermissionMutation.mutate({
                            userId: permission.userId,
                            permission: option.value,
                          })
                        }
                        className={cn(
                          'flex-1 rounded-md px-2 py-1 text-[10.5px]',
                          permission.permission === option.value
                            ? 'bg-doc-ink text-doc-paper hover:bg-doc-ink/90'
                            : 'border-doc-line bg-background text-doc-muted hover:bg-doc-paper-strong',
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {!permission.isDefault && permission.grantedBy && (
                    <p className="mt-1.5 text-[9px] text-doc-muted">
                      Asignado por {permission.grantedBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data && data.meta.total > PAGE_SIZE && (
            <Pagination
              page={page}
              total={data.meta.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="trabajadores"
            />
          )}

          <p className="mt-4 text-[10px] leading-relaxed text-doc-muted">
            {access.canManagePermissions
              ? 'Solo el superadministrador puede administrar estos accesos.'
              : 'No tienes permisos para administrar accesos.'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
