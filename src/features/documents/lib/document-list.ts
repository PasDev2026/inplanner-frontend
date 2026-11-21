import type { QueryDocumentsParams } from './types'

export const DOCUMENT_PAGE_SIZE = 50

export function buildDocumentListParams({
  isSearching,
  search,
  activeFolderId,
  activeRootId,
}: {
  isSearching: boolean
  search: string
  activeFolderId: string | null
  activeRootId: string | null
}): QueryDocumentsParams {
  if (isSearching) {
    return { q: search, page: 1, limit: DOCUMENT_PAGE_SIZE }
  }

  const scopedFolderId = activeFolderId ?? activeRootId

  return scopedFolderId
    ? { folderId: scopedFolderId, page: 1, limit: DOCUMENT_PAGE_SIZE }
    : { page: 1, limit: DOCUMENT_PAGE_SIZE }
}

export function buildFolderSubtitle(
  activeFolderId: string | null,
  activeRootId: string | null,
): string {
  return activeFolderId || activeRootId
    ? 'Documentos de la carpeta'
    : 'Recientes en el archivo'
}
