import { useQuery } from '@tanstack/react-query'
import {
  findDocumentUsers,
  getDocumentUrl,
  getFolder,
  getFolderTree,
  getDocuments,
  getPermissions,
  getTrash,
} from '../actions/documents.api'
import { documentKeys } from '../lib/document-keys'
import type {
  QueryDocumentsParams,
  QueryPermissionsParams,
  QueryTrashParams,
} from '../lib/types'

export function useFolderTree() {
  return useQuery({
    queryKey: documentKeys.tree,
    queryFn: getFolderTree,
    staleTime: 30_000,
  })
}

export function useDocumentList(params: QueryDocumentsParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
    staleTime: 15_000,
  })
}

export function useFolderDetail(id: string | null) {
  return useQuery({
    queryKey: documentKeys.folder(id ?? 'none'),
    queryFn: () => getFolder(id as string),
    enabled: Boolean(id),
    staleTime: 15_000,
  })
}

export function useTrash(params: QueryTrashParams) {
  return useQuery({
    queryKey: documentKeys.trash(params),
    queryFn: () => getTrash(params),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  })
}

export function usePermissions(params: QueryPermissionsParams) {
  return useQuery({
    queryKey: documentKeys.permissions(params),
    queryFn: () => getPermissions(params),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  })
}

export function useDocumentUsers(search: string) {
  return useQuery({
    queryKey: documentKeys.users(search),
    queryFn: () => findDocumentUsers(search),
    enabled: search.trim().length >= 2,
    staleTime: 60_000,
  })
}

export function useDocumentUrl(
  documentId: string | null,
  mode: 'preview' | 'download',
) {
  return useQuery({
    queryKey: ['documentUrl', documentId, mode],
    queryFn: () => getDocumentUrl(documentId as string, mode),
    enabled: Boolean(documentId),
    staleTime: 10 * 60_000,
    retry: false,
  })
}
