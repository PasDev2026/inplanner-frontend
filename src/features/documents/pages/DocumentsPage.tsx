import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthContext } from '@/features/auth/hooks/useAuthContext'
import { cn } from '@/features/shared/lib/utils'
import { getDocumentUrl } from '../actions/documents.api'
import type { DocumentItem, FolderNode } from '../lib/types'
import { isPreviewable } from '../lib/file-type'
import {
  buildDocumentListParams,
  buildFolderSubtitle,
} from '../lib/document-list'
import {
  buildSedeNameMap,
  countFolderDocuments,
} from '../lib/folder-utils'
import { useDocumentAccess } from '../hooks/useDocumentAccess'
import { useDocumentSedes } from '../hooks/useDocumentCatalogs'
import {
  persistClosedRootIds,
  readClosedRootIds,
} from '../lib/shelf-state'
import {
  useDocumentList,
  useDocumentUrl,
  useFolderTree,
} from '../hooks/useDocumentQueries'
import { useDocumentMutations } from '../hooks/useDocumentMutations'
import { ShelfTabs } from '../components/ShelfTabs'
import { FolderTree } from '../components/FolderTree'
import { DocumentLedger } from '../components/DocumentLedger'
import { ReadingPane } from '../components/ReadingPane'
import { FolderDialog } from '../components/FolderDialog'
import { UploadDialog } from '../components/UploadDialog'
import { DeleteFolderDialog } from '../components/DeleteFolderDialog'
import { DocumentEditDialog } from '../components/DocumentEditDialog'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { AccessSheet } from '../components/AccessSheet'
import { TrashView } from '../components/TrashView'
import { PrivacyStamp } from '../components/PrivacyStamp'
import { FolderScopeBadges } from '../components/FolderScopeBadges'
import { FoldersOverview } from '../components/FoldersOverview'

function findFolder(nodes: FolderNode[], id: string): FolderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = node.children ? findFolder(node.children, id) : null
    if (found) return found
  }
  return null
}

function findPath(nodes: FolderNode[], id: string): FolderNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node]
    const childPath = node.children ? findPath(node.children, id) : []
    if (childPath.length > 0) return [node, ...childPath]
  }
  return []
}

export default function DocumentsPage() {
  const { data: access } = useDocumentAccess()
  const { user } = useAuthContext()
  const userId = user?.id ?? 'anonymous'
  const {
    data: tree,
    isLoading: treeLoading,
    isError: treeError,
    refetch,
  } = useFolderTree()
  const { deleteDocumentMutation } = useDocumentMutations()
  const searchRef = useRef<HTMLInputElement>(null)
  const { data: sedes = [] } = useDocumentSedes()
  const sedeNames = useMemo(() => buildSedeNameMap(sedes), [sedes])

  const roots = useMemo(() => tree ?? [], [tree])
  const [closedRootIds, setClosedRootIds] = useState<Set<string>>(() =>
    readClosedRootIds(userId),
  )
  const openRoots = useMemo(
    () => roots.filter((root) => !closedRootIds.has(root.id)),
    [roots, closedRootIds],
  )
  const [activeRootId, setActiveRootId] = useState<string | null>(null)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'documents' | 'folders' | 'trash'>('documents')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null,
  )
  const [uploadOpen, setUploadOpen] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(
    null,
  )
  const [documentToEdit, setDocumentToEdit] = useState<DocumentItem | null>(null)
  const [folderDialog, setFolderDialog] = useState<{
    open: boolean
    mode: 'create-root' | 'create-subfolder' | 'edit'
    parent: FolderNode | null
    folder: FolderNode | null
  }>({
    open: false,
    mode: 'create-root',
    parent: null,
    folder: null,
  })

  useEffect(() => {
    persistClosedRootIds(userId, closedRootIds)
  }, [userId, closedRootIds])

  useEffect(() => {
    if (roots.length === 0) return

    setClosedRootIds((current) => {
      const rootIds = new Set(roots.map((root) => root.id))
      const next = new Set([...current].filter((id) => rootIds.has(id)))
      return next.size === current.size ? current : next
    })
  }, [roots])

  useEffect(() => {
    if (openRoots.length === 0) {
      setActiveRootId(null)
      setActiveFolderId(null)
      return
    }
    if (
      !activeRootId ||
      !openRoots.some((root) => root.id === activeRootId)
    ) {
      setActiveRootId(openRoots[0].id)
    }
  }, [activeRootId, openRoots])

  useEffect(() => {
    if (!activeFolderId) return
    const root = openRoots.find((item) => item.id === activeRootId)
    if (!root || !findFolder([root], activeFolderId)) {
      setActiveFolderId(null)
    }
  }, [activeFolderId, activeRootId, openRoots])

  useEffect(() => {
    if (!access?.canEdit && tab === 'trash') {
      setTab('documents')
    }
  }, [access?.canEdit, tab])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const activeRoot = openRoots.find((root) => root.id === activeRootId) ?? null
  const activeFolder = activeFolderId
    ? findFolder(activeRoot ? [activeRoot] : openRoots, activeFolderId)
    : activeRoot
  const currentFolder = activeFolder
  const isSearching = search.length >= 2
  const canEditCurrent = Boolean(currentFolder?.canEdit)
  const canCreateRoot = Boolean(access?.canCreateRootFolder)
  const canManage = Boolean(access?.canManagePermissions)

  const listParams = useMemo(
    () =>
      buildDocumentListParams({
        isSearching,
        search,
        activeFolderId,
        activeRootId,
      }),
    [isSearching, search, activeFolderId, activeRootId],
  )

  const { data: documentsPage, isLoading: documentsLoading } =
    useDocumentList(listParams)
  const documents = documentsPage?.data ?? []
  const preview = useDocumentUrl(
    selectedDocument && isPreviewable(selectedDocument.mimeType)
      ? selectedDocument.id
      : null,
    'preview',
  )
  const selectedFolder = selectedDocument
    ? findFolder(roots, selectedDocument.folderId)
    : null

  const breadcrumb = activeFolderId
    ? findPath(activeRoot ? [activeRoot] : openRoots, activeFolderId)
    : activeRoot
      ? [activeRoot]
      : []

  const selectRoot = (id: string) => {
    setActiveRootId(id)
    setActiveFolderId(null)
    setSelectedDocument(null)
    setSearchInput('')
  }

  const selectFolder = (id: string | null) => {
    setActiveFolderId(id)
    setSelectedDocument(null)
    setSearchInput('')
    setSearch('')
  }

  const openCreateRoot = () => {
    setFolderDialog({
      open: true,
      mode: 'create-root',
      parent: null,
      folder: null,
    })
  }

  const openCreateSubfolder = () => {
    if (!currentFolder) return
    setFolderDialog({
      open: true,
      mode: 'create-subfolder',
      parent: currentFolder,
      folder: null,
    })
  }

  const openEditFolder = () => {
    if (!currentFolder) return
    setFolderDialog({
      open: true,
      mode: 'edit',
      parent: currentFolder.parentId ? currentFolder : null,
      folder: currentFolder,
    })
  }

  const openFolderFromOverview = (folderId: string, rootId: string) => {
    setClosedRootIds((current) => {
      if (!current.has(rootId)) return current
      const next = new Set(current)
      next.delete(rootId)
      return next
    })
    setActiveRootId(rootId)
    setActiveFolderId(folderId === rootId ? null : folderId)
    setSelectedDocument(null)
    setSearchInput('')
    setSearch('')
    setTab('documents')
  }

  const closeRoot = (id: string) => {
    const remaining = openRoots.filter((root) => root.id !== id)

    setClosedRootIds((current) => new Set(current).add(id))

    if (activeRootId === id) {
      setActiveRootId(remaining[0]?.id ?? null)
      setActiveFolderId(null)
      setSelectedDocument(null)
      setSearchInput('')
      setSearch('')
    }
  }

  const downloadDocument = async (document: DocumentItem) => {
    try {
      const { url } = await getDocumentUrl(document.id, 'download')
      window.open(url, '_blank', 'noopener')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo descargar',
      )
    }
  }

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return
    await deleteDocumentMutation.mutateAsync(documentToDelete.id)
    if (selectedDocument?.id === documentToDelete.id) {
      setSelectedDocument(null)
    }
    setDocumentToDelete(null)
  }

  const folderSubtitle = buildFolderSubtitle(activeFolderId, activeRootId)

  if (!access) return null

  return (
    <div className="documents-workspace -m-5 flex h-[calc(100dvh-4.5rem)] min-h-[560px] flex-col overflow-hidden bg-doc-paper text-doc-ink">
      <header className="flex flex-col gap-3 border-b border-doc-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-doc-ink">
            Documentos
          </h1>
          <p className="mt-1 text-[11px] text-doc-muted">
            El archivo interno de INSALUD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[210px] flex-1 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-doc-muted" />
            <Input
              ref={searchRef}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar en todo el archivo…"
              className="h-9 w-full pl-8 pr-12 lg:w-[260px]"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-doc-line bg-doc-paper-strong px-1.5 py-0.5 text-[9px] font-semibold text-doc-muted lg:inline">
              ⌘K
            </kbd>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateRoot}
            disabled={!canCreateRoot}
            className="rounded-full px-3"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nueva carpeta
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setUploadOpen(true)}
            disabled={!access.canEdit}
            className="rounded-full bg-doc-accent px-3 text-white hover:bg-doc-accent/90"
          >
            <Upload className="mr-1 h-3.5 w-3.5" />
            Subir
          </Button>
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAccessOpen(true)}
            >
              <Users className="mr-1 h-3.5 w-3.5" />
              Accesos
            </Button>
          )}
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-doc-line px-4">
        <button
          type="button"
          onClick={() => setTab('documents')}
          className={cn(
            'border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
            tab === 'documents'
              ? 'border-doc-accent text-doc-ink'
              : 'border-transparent text-doc-muted hover:text-doc-ink',
          )}
        >
          Documentos
        </button>
        <button
          type="button"
          onClick={() => setTab('folders')}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
            tab === 'folders'
              ? 'border-doc-accent text-doc-ink'
              : 'border-transparent text-doc-muted hover:text-doc-ink',
          )}
        >
          <Folder className="h-3.5 w-3.5" />
          Todas las carpetas
        </button>
        {access.canEdit && (
          <button
            type="button"
            onClick={() => setTab('trash')}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
              tab === 'trash'
                ? 'border-doc-accent text-doc-ink'
                : 'border-transparent text-doc-muted hover:text-doc-ink',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Papelera
          </button>
        )}
      </div>

      {tab === 'trash' ? (
        <div className="min-h-0 flex-1">
          <TrashView />
        </div>
      ) : tab === 'folders' ? (
        <div className="min-h-0 flex-1">
          <FoldersOverview
            roots={roots}
            sedeNames={sedeNames}
            onOpenFolder={openFolderFromOverview}
          />
        </div>
      ) : (
        <>
          <div className="border-b border-doc-line px-3 pt-3">
            {treeLoading ? (
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-9 w-[130px] rounded-t-lg bg-doc-paper-strong"
                  />
                ))}
              </div>
            ) : (
              <ShelfTabs
                roots={openRoots}
                activeRootId={activeRootId}
                onSelect={selectRoot}
                onCreate={canCreateRoot ? openCreateRoot : undefined}
                onClose={closeRoot}
              />
            )}
          </div>

          {treeError ? (
            <Empty className="flex-1 p-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Archive className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle className="text-xl font-semibold">
                  No pudimos cargar el archivo
                </EmptyTitle>
                <EmptyDescription>
                  Revisa tu conexión e inténtalo de nuevo.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </EmptyContent>
            </Empty>
          ) : openRoots.length === 0 && roots.length > 0 && !treeLoading ? (
            <Empty className="flex-1 p-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Archive className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl font-semibold tracking-tight">
                  No hay estantes abiertos
                </EmptyTitle>
                <EmptyDescription className="max-w-md">
                  Abre una carpeta desde “Todas las carpetas” para volver a
                  mostrarla aquí.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTab('folders')}
                >
                  Ver todas las carpetas
                </Button>
              </EmptyContent>
            </Empty>
          ) : roots.length === 0 && !treeLoading ? (
            <Empty className="flex-1 p-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Archive className="h-5 w-5" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl font-semibold tracking-tight">
                  Aún no hay estantes en el archivo
                </EmptyTitle>
                <EmptyDescription className="max-w-md">
                  Crea la primera carpeta principal para organizar los
                  documentos de un área.
                </EmptyDescription>
              </EmptyHeader>
              {canCreateRoot && (
                <EmptyContent>
                  <Button
                    type="button"
                    onClick={openCreateRoot}
                    className="bg-doc-accent text-white hover:bg-doc-accent/90"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Crear carpeta principal
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="flex min-h-0 flex-1">
              <aside className="hidden w-[240px] shrink-0 overflow-y-auto border-r border-doc-line bg-doc-paper-strong/40 p-2 lg:block">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                    Carpetas
                  </span>
                  {canEditCurrent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={openCreateSubfolder}
                      aria-label="Nueva subcarpeta"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <FolderTree
                  nodes={currentFolder?.children ?? []}
                  activeId={activeFolderId}
                  onSelect={selectFolder}
                />
              </aside>

              <main className="min-w-0 flex-1 overflow-y-auto">
                <div className="flex items-center gap-1 border-b border-doc-line px-4 py-2 text-[11px] text-doc-muted">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFolderId(null)
                      setSelectedDocument(null)
                    }}
                    className="hover:text-doc-ink"
                  >
                    Documentos
                  </button>
                  {breadcrumb.map((item) => (
                    <span key={item.id} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      <button
                        type="button"
                        onClick={() => selectFolder(item.id)}
                        className="max-w-[180px] truncate hover:text-doc-ink"
                      >
                        {item.name}
                      </button>
                    </span>
                  ))}
                </div>

                {currentFolder && (
                  <div className="flex flex-col gap-3 border-b border-doc-line px-4 py-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-doc-accent" />
                        <h2 className="truncate text-2xl font-semibold tracking-tight text-doc-ink">
                          {currentFolder.name}
                        </h2>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-doc-muted">
                        <PrivacyStamp level={currentFolder.privacyLevel} />
                        <FolderScopeBadges
                          sedeName={
                            currentFolder.sedeId
                              ? sedeNames.get(currentFolder.sedeId)
                              : null
                          }
                          areaName={currentFolder.areaName}
                        />
                        <span>
                          Dueño: {currentFolder.owner?.name ?? '—'}
                        </span>
                        <span>
                          {countFolderDocuments(currentFolder)} documento(s)
                        </span>
                        {!canEditCurrent && <span>Solo lectura</span>}
                      </div>
                    </div>

                    {canEditCurrent && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={openCreateSubfolder}
                        >
                          <FolderPlus className="mr-1 h-3.5 w-3.5" />
                          Nueva subcarpeta
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={openEditFolder}
                          aria-label="Editar carpeta"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-doc-danger hover:text-doc-danger"
                          onClick={() => setDeleteFolderOpen(true)}
                          aria-label="Eliminar carpeta"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!isSearching && (currentFolder?.children?.length ?? 0) > 0 && (
                  <div className="border-b border-doc-line">
                    <div className="px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                      Carpetas
                    </div>
                    {currentFolder?.children?.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => selectFolder(child.id)}
                        className="flex w-full items-center gap-2 border-t border-doc-line/60 px-4 py-2 text-left text-xs text-doc-ink transition-colors first:border-t-0 hover:bg-doc-paper-strong/60"
                      >
                        <Folder className="h-3.5 w-3.5 text-doc-accent" />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {child.name}
                        </span>
                        <span className="text-[10px] tabular-nums text-doc-muted">
                          {countFolderDocuments(child)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-doc-muted" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-doc-muted">
                    {isSearching
                      ? `Resultados para “${search}”`
                      : folderSubtitle}
                  </span>
                  {isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      className="text-[10px] text-doc-muted underline underline-offset-2 hover:text-doc-ink"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>

                <DocumentLedger
                  documents={documents}
                  selectedId={selectedDocument?.id ?? null}
                  onSelect={setSelectedDocument}
                  onDownload={downloadDocument}
                  onEdit={setDocumentToEdit}
                  onDelete={setDocumentToDelete}
                  canEdit={canEditCurrent}
                  isLoading={documentsLoading}
                />

                {documentsPage &&
                  documentsPage.meta.total > documents.length && (
                    <p className="px-4 py-3 text-[10px] text-doc-muted">
                      Mostrando {documents.length} de{' '}
                      {documentsPage.meta.total} documentos. Usa el buscador
                      para refinar.
                    </p>
                  )}

                {!documentsLoading && documents.length === 0 && (
                  <Empty className="px-6 py-14">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FolderOpen className="h-5 w-5" />
                      </EmptyMedia>
                      <EmptyTitle className="text-xl font-semibold">
                        {isSearching
                          ? 'No encontramos documentos'
                          : 'Esta carpeta está vacía'}
                      </EmptyTitle>
                      <EmptyDescription className="max-w-sm">
                        {isSearching
                          ? 'Prueba con otro nombre o revisa que la carpeta sea visible para ti.'
                          : 'Sube el primer documento o crea una subcarpeta.'}
                      </EmptyDescription>
                    </EmptyHeader>
                    {!isSearching && canEditCurrent && (
                      <EmptyContent>
                        <Button
                          type="button"
                          onClick={() => setUploadOpen(true)}
                          className="bg-doc-accent text-white hover:bg-doc-accent/90"
                        >
                          <Upload className="mr-1.5 h-4 w-4" />
                          Subir documento
                        </Button>
                      </EmptyContent>
                    )}
                  </Empty>
                )}
              </main>

              <ReadingPane
                document={selectedDocument}
                url={preview.data?.url}
                isLoading={preview.isLoading}
                onClose={() => setSelectedDocument(null)}
                onDownload={downloadDocument}
                onEdit={setDocumentToEdit}
                onDelete={setDocumentToDelete}
                canEdit={Boolean(selectedFolder?.canEdit)}
              />
            </div>
          )}
        </>
      )}

      <FolderDialog
        open={folderDialog.open}
        onOpenChange={(open) =>
          setFolderDialog((current) => ({ ...current, open }))
        }
        mode={folderDialog.mode}
        parent={folderDialog.parent}
        folder={folderDialog.folder}
        access={access}
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={roots}
        defaultFolderId={activeFolderId}
      />

      <DeleteFolderDialog
        open={deleteFolderOpen}
        onOpenChange={setDeleteFolderOpen}
        folder={currentFolder}
        onDeleted={() => {
          setActiveFolderId(null)
          setSelectedDocument(null)
        }}
      />

      <DocumentEditDialog
        open={Boolean(documentToEdit)}
        onOpenChange={(open) => !open && setDocumentToEdit(null)}
        document={documentToEdit}
        roots={roots}
      />

      <ConfirmDialog
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        title="Eliminar documento"
        description={`“${documentToDelete?.fileName ?? ''}” se moverá a la papelera. Podrás restaurarlo durante los próximos 30 días.`}
        confirmLabel="Mover a papelera"
        onConfirm={confirmDeleteDocument}
        isPending={deleteDocumentMutation.isPending}
      />

      {accessOpen && canManage && (
        <AccessSheet
          open={accessOpen}
          onOpenChange={setAccessOpen}
          access={access}
        />
      )}
    </div>
  )
}
