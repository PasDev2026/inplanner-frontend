import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Folder, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { FolderNode } from '../lib/types'
import {
  collectExpandedIds,
  filterFolderTree,
  flattenFolders,
  formatSedeName,
} from '../lib/folder-utils'
import { PRIVACY_OPTIONS } from '../lib/privacy'
import { FolderTreeRow } from './FolderTreeRow'

const ALL = 'all'

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  const selectedLabel =
    value === ALL
      ? placeholder
      : (options.find((option) => option.value === value)?.label ?? placeholder)

  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? ALL)}>
      <Select.Trigger className="h-9 w-full border-doc-line bg-background text-xs text-doc-ink lg:w-[190px]">
        <Select.Value placeholder={placeholder}>{selectedLabel}</Select.Value>
      </Select.Trigger>
      <Select.Popup>
        <Select.List>
          <Select.Item value={ALL}>{placeholder}</Select.Item>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popup>
    </Select>
  )
}

export function FoldersOverview({
  roots,
  sedeNames,
  onOpenFolder,
}: {
  roots: FolderNode[]
  sedeNames: Map<string, string>
  onOpenFolder: (folderId: string, rootId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [sedeFilter, setSedeFilter] = useState(ALL)
  const [areaFilter, setAreaFilter] = useState(ALL)
  const [privacyFilter, setPrivacyFilter] = useState(ALL)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const folders = useMemo(() => flattenFolders(roots), [roots])

  const sedeOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const folder of folders) {
      if (!folder.sedeId) continue
      const name = formatSedeName(sedeNames.get(folder.sedeId))
      if (name) map.set(folder.sedeId, name)
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [folders, sedeNames])

  const areaOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const folder of folders) {
      if (folder.areaId === null) continue
      if (folder.areaName) map.set(String(folder.areaId), folder.areaName)
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [folders])

  const privacyOptions = useMemo(
    () =>
      PRIVACY_OPTIONS.map((option) => ({
        value: String(option.value),
        label: option.label,
      })),
    [],
  )

  const isFiltering =
    search.trim().length > 0 ||
    sedeFilter !== ALL ||
    areaFilter !== ALL ||
    privacyFilter !== ALL

  const filteredTree = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')

    return filterFolderTree(roots, (folder) => {
      if (sedeFilter !== ALL && folder.sedeId !== sedeFilter) return false
      if (areaFilter !== ALL && String(folder.areaId) !== areaFilter) {
        return false
      }
      if (
        privacyFilter !== ALL &&
        String(folder.privacyLevel) !== privacyFilter
      ) {
        return false
      }
      if (!term) return true

      return (
        folder.name.toLocaleLowerCase('es').includes(term) ||
        (folder.owner?.name ?? '').toLocaleLowerCase('es').includes(term) ||
        (folder.areaName ?? '').toLocaleLowerCase('es').includes(term) ||
        formatSedeName(sedeNames.get(folder.sedeId ?? ''))
          ?.toLocaleLowerCase('es')
          .includes(term) ||
        false
      )
    })
  }, [roots, search, sedeFilter, areaFilter, privacyFilter, sedeNames])

  const matchedFolders = useMemo(
    () => flattenFolders(filteredTree).length,
    [filteredTree],
  )

  useEffect(() => {
    if (!isFiltering) return
    setExpandedIds(new Set(collectExpandedIds(filteredTree)))
  }, [isFiltering, filteredTree])

  const toggleFolder = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(collectExpandedIds(filteredTree)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  if (roots.length === 0) {
    return (
      <Empty className="h-full p-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder className="h-5 w-5" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-semibold">
            No hay carpetas visibles
          </EmptyTitle>
          <EmptyDescription>
            Cuando existan carpetas visibles para tu usuario aparecerán aquí.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-doc-line p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-doc-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar carpeta, sede, área o dueño…"
              className="h-9 pl-8"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
            <FilterSelect
              value={sedeFilter}
              onChange={setSedeFilter}
              placeholder="Todas las sedes"
              options={sedeOptions}
            />
            <FilterSelect
              value={areaFilter}
              onChange={setAreaFilter}
              placeholder="Todas las áreas"
              options={areaOptions}
            />
            <FilterSelect
              value={privacyFilter}
              onChange={setPrivacyFilter}
              placeholder="Toda privacidad"
              options={privacyOptions}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-doc-muted">
            {matchedFolders} de {folders.length} carpetas visibles
          </p>

          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="xs" onClick={expandAll}>
              <ChevronDown className="h-3.5 w-3.5" />
              Expandir todo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={collapseAll}
            >
              <ChevronUp className="h-3.5 w-3.5" />
              Contraer todo
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredTree.length === 0 ? (
          <Empty className="p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-semibold">
                No encontramos carpetas
              </EmptyTitle>
              <EmptyDescription>
                Prueba con otro nombre o limpia los filtros.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div role="tree" aria-label="Todas las carpetas visibles">
            <div className="hidden items-center gap-3 border-b border-doc-line px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted md:flex">
              <span className="min-w-0 flex-1">Carpeta</span>
              <span className="w-[120px] shrink-0">Sede</span>
              <span className="hidden w-[140px] shrink-0 lg:block">Área</span>
              <span className="w-[110px] shrink-0">Privacidad</span>
              <span className="hidden w-[140px] shrink-0 xl:block">Dueño</span>
              <span className="w-[70px] shrink-0 text-right">Docs</span>
              <span className="hidden w-[85px] shrink-0 text-right lg:block">
                Subcarp.
              </span>
              <span className="hidden w-[110px] shrink-0 text-right xl:block">
                Actualizado
              </span>
            </div>

            {filteredTree.map((folder) => (
              <FolderTreeRow
                key={folder.id}
                folder={folder}
                depth={0}
                rootId={folder.id}
                expandedIds={expandedIds}
                onToggle={toggleFolder}
                onOpenFolder={onOpenFolder}
                sedeNames={sedeNames}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
