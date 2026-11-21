import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuthContext } from '@/features/auth/hooks/useAuthContext'
import { cn } from '@/features/shared/lib/utils'
import type {
  CreateFolderPayload,
  DocumentAccess,
  DocumentUser,
  FolderNode,
  UpdateFolderPayload,
} from '../lib/types'
import { PRIVACY_OPTIONS } from '../lib/privacy'
import {
  useDocumentAreas,
  useDocumentSedes,
} from '../hooks/useDocumentCatalogs'
import { useFolderDetail, useDocumentUsers } from '../hooks/useDocumentQueries'
import { useDocumentMutations } from '../hooks/useDocumentMutations'

type FolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create-root' | 'create-subfolder' | 'edit'
  parent?: FolderNode | null
  folder?: FolderNode | null
  access: DocumentAccess
}

export function FolderDialog({
  open,
  onOpenChange,
  mode,
  parent,
  folder,
  access,
}: FolderDialogProps) {
  const { user } = useAuthContext()
  const { createFolderMutation, updateFolderMutation } = useDocumentMutations()
  const { data: detail } = useFolderDetail(open && folder ? folder.id : null)
  const source = detail ?? folder ?? null
  const isRoot =
    mode === 'create-root' || (mode === 'edit' && source?.parentId === null)
  const isEdit = mode === 'edit'
  const canChooseArea = access.canManagePermissions
  const canChooseSede = access.canManagePermissions
  const sourceOwnerId = source?.owner?.id ?? null
  const isOwner = Boolean(sourceOwnerId && sourceOwnerId === user?.id)
  const canSetPrivate = access.canManagePermissions || !source || isOwner

  const [name, setName] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState(0)
  const [areaId, setAreaId] = useState<number | null>(access.areaId)
  const [sedeId, setSedeId] = useState<string | null>(access.activeSedeId)
  const [mentionedUsers, setMentionedUsers] = useState<DocumentUser[]>([])
  const [search, setSearch] = useState('')

  const { data: areas = [] } = useDocumentAreas(
    open && isRoot && canChooseArea,
  )

  const { data: sedes = [] } = useDocumentSedes(
    open && isRoot && canChooseSede,
  )

  const { data: userResults = [] } = useDocumentUsers(search)

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }

    setName(source?.name ?? '')
    setPrivacyLevel(source?.privacyLevel ?? 0)
    setAreaId(source?.areaId ?? access.areaId)
    setSedeId(source?.sedeId ?? access.activeSedeId)
    setMentionedUsers(
      (source?.mentionedUsers ?? []).map((mentioned) => ({
        id: mentioned.id,
        name: mentioned.name,
        areaId: null,
        areaName: null,
        sedeId: null,
      })),
    )
    setSearch('')
  }, [open, source, access.areaId, access.activeSedeId])

  useEffect(() => {
    if (!open || !isRoot || privacyLevel !== 3 || !user || !sourceOwnerId) {
      return
    }
    if (sourceOwnerId === user.id) return

    setMentionedUsers((current) => {
      if (current.some((mentioned) => mentioned.id === user.id)) return current
      return [
        ...current,
        {
          id: user.id,
          name: [user.nombres, user.apellidoPaterno].filter(Boolean).join(' '),
          areaId: access.areaId,
          areaName: access.areaName,
          sedeId: access.activeSedeId,
        },
      ]
    })
  }, [open, isRoot, privacyLevel, sourceOwnerId, user, access])

  const ownerIdForMentions = source?.owner?.id ?? user?.id ?? null
  const filteredUsers = useMemo(
    () =>
      userResults.filter(
        (candidate) =>
          candidate.id !== ownerIdForMentions &&
          !mentionedUsers.some((mentioned) => mentioned.id === candidate.id),
      ),
    [userResults, mentionedUsers, ownerIdForMentions],
  )

  const isPending =
    createFolderMutation.isPending || updateFolderMutation.isPending

  const privacyValid =
    !isRoot ||
    (privacyLevel === 1 && Boolean(areaId)) ||
    (privacyLevel === 2 && Boolean(sedeId)) ||
    (privacyLevel === 3 && mentionedUsers.length > 0) ||
    (privacyLevel !== 1 && privacyLevel !== 2 && privacyLevel !== 3)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed || !privacyValid) return

    if (mode === 'create-root') {
      const payload: CreateFolderPayload = {
        name: trimmed,
        parentId: null,
        privacyLevel,
        areaId: privacyLevel === 1 ? areaId ?? undefined : areaId ?? undefined,
        sedeId: privacyLevel === 2 ? sedeId ?? undefined : sedeId ?? undefined,
        mentionedUserIds:
          privacyLevel === 3
            ? mentionedUsers.map((mentioned) => mentioned.id)
            : undefined,
      }
      await createFolderMutation.mutateAsync(payload)
    } else if (mode === 'create-subfolder') {
      await createFolderMutation.mutateAsync({
        name: trimmed,
        parentId: parent?.id,
      })
    } else if (folder) {
      const payload: UpdateFolderPayload = { name: trimmed }
      if (isRoot) {
        payload.privacyLevel = privacyLevel
        payload.areaId = areaId ?? undefined
        payload.sedeId = sedeId ?? undefined
        payload.mentionedUserIds =
          privacyLevel === 3
            ? mentionedUsers.map((mentioned) => mentioned.id)
            : []
      }
      await updateFolderMutation.mutateAsync({ id: folder.id, payload })
    }

    onOpenChange(false)
  }

  const title =
    mode === 'create-root'
      ? 'Nueva carpeta principal'
      : mode === 'create-subfolder'
        ? 'Nueva subcarpeta'
        : 'Editar carpeta'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="doc-portal max-w-lg border border-doc-line bg-doc-paper text-doc-ink">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-doc-muted">
            {isRoot
              ? 'La privacidad se define aquí y se hereda a las subcarpetas.'
              : 'Las subcarpetas heredan la privacidad de la carpeta principal.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name" className="text-doc-ink">
              Nombre
            </Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Manual de Operaciones"
              maxLength={150}
              autoFocus
            />
          </div>

          {isRoot && (
            <div className="space-y-2">
              <Label className="text-doc-ink">Visibilidad</Label>
              <div className="divide-y divide-doc-line rounded-lg border border-doc-line bg-doc-paper-strong/40">
                {PRIVACY_OPTIONS.map((option) => {
                  const disabled = option.value === 4 && !canSetPrivate
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors',
                        privacyLevel === option.value && 'bg-doc-accent-soft/60',
                        disabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        className="mt-1 accent-[hsl(var(--doc-accent))]"
                        checked={privacyLevel === option.value}
                        disabled={disabled}
                        onChange={() => {
                          setPrivacyLevel(option.value)
                          if (option.value === 1 && !canChooseArea) {
                            setAreaId(access.areaId)
                          }
                          if (option.value === 2 && !canChooseSede) {
                            setSedeId(access.activeSedeId)
                          }
                        }}
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-doc-ink">
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              option.dot,
                            )}
                          />
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-doc-muted">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {isRoot && privacyLevel === 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="folder-area" className="text-doc-ink">
                Área
              </Label>
              {canChooseArea ? (
                <Select
                  value={areaId ? String(areaId) : ''}
                  onValueChange={(value) =>
                    setAreaId(value ? Number(value) : null)
                  }
                >
                  <Select.Trigger
                    id="folder-area"
                    className="h-9 border-doc-line bg-background text-doc-ink"
                  >
                    <Select.Value placeholder="Selecciona un área">
                      {
                        areas.find(
                          (area) => String(area.id_area) === String(areaId),
                        )?.nombre_area
                      }
                    </Select.Value>
                  </Select.Trigger>
                  <Select.Popup>
                    <Select.List>
                      {areas.map((area) => (
                        <Select.Item
                          key={area.id_area}
                          value={String(area.id_area)}
                        >
                          {area.nombre_area}
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select>
              ) : (
                <p className="rounded-md border border-doc-line bg-doc-paper-strong/40 px-3 py-2 text-sm text-doc-muted">
                  {access.areaName ?? 'Sin área asignada'}
                </p>
              )}
            </div>
          )}

          {isRoot && privacyLevel === 2 && (
            <div className="space-y-1.5">
              <Label htmlFor="folder-sede" className="text-doc-ink">
                Sede
              </Label>
              {canChooseSede ? (
                <Select
                  value={sedeId ?? ''}
                  onValueChange={(value) => setSedeId(value || null)}
                >
                  <Select.Trigger
                    id="folder-sede"
                    className="h-9 border-doc-line bg-background text-doc-ink"
                  >
                    <Select.Value placeholder="Selecciona una sede">
                      {sedes.find((sede) => sede.id === sedeId)?.nombre}
                    </Select.Value>
                  </Select.Trigger>
                  <Select.Popup>
                    <Select.List>
                      {sedes.map((sede) => (
                        <Select.Item key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select>
              ) : (
                <p className="rounded-md border border-doc-line bg-doc-paper-strong/40 px-3 py-2 text-sm text-doc-muted">
                  Sede activa
                </p>
              )}
            </div>
          )}

          {isRoot && privacyLevel === 3 && (
            <div className="space-y-2">
              <Label className="text-doc-ink">Usuarios mencionados</Label>
              <div className="flex flex-wrap gap-1.5">
                {mentionedUsers.map((mentioned) => (
                  <span
                    key={mentioned.id}
                    className="inline-flex items-center gap-1 rounded-full border border-doc-line bg-background px-2 py-1 text-[11px] text-doc-ink"
                  >
                    {mentioned.name}
                    <button
                      type="button"
                      onClick={() =>
                        setMentionedUsers((current) =>
                          current.filter((item) => item.id !== mentioned.id),
                        )
                      }
                      className="text-doc-muted hover:text-doc-danger"
                      aria-label={`Quitar ${mentioned.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, email o documento…"
              />
              {search.trim().length >= 2 && filteredUsers.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border border-doc-line bg-background p-1">
                  {filteredUsers.map((candidate) => (
                    <Button
                      key={candidate.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMentionedUsers((current) => [...current, candidate])
                        setSearch('')
                      }}
                      className="h-auto w-full justify-between gap-2 px-2 py-1.5 text-left text-xs font-normal"
                    >
                      <span className="truncate text-doc-ink">
                        {candidate.name}
                      </span>
                      <span className="shrink-0 text-doc-muted">
                        {candidate.areaName ?? 'Sin área'}
                      </span>
                      <Plus className="h-3 w-3 shrink-0 text-doc-muted" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-doc-line bg-doc-paper-strong/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!name.trim() || !privacyValid || isPending}
            className="bg-doc-accent text-white hover:bg-doc-accent/90"
          >
            {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear carpeta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
