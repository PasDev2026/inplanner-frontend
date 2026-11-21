import api from '@/features/shared/lib/axios'
import { handleApiError } from '@/features/shared/lib/handle-api-error'
import type {
  CreateFolderPayload,
  DocumentAccess,
  DocumentItem,
  DocumentUser,
  FolderNode,
  Paginated,
  PermissionItem,
  QueryDocumentsParams,
  QueryPermissionsParams,
  QueryTrashParams,
  TrashItem,
  UpdateFolderPayload,
} from '../lib/types'

export async function getDocumentAccess(): Promise<DocumentAccess> {
  try {
    const { data } = await api.get<DocumentAccess>('/documents/access')
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo obtener el acceso a Documentos')
  }
}

export async function getFolderTree(): Promise<FolderNode[]> {
  try {
    const { data } = await api.get<FolderNode[]>('/documents/folders/tree')
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar el árbol de carpetas')
  }
}

export async function getFolder(id: string): Promise<FolderNode> {
  try {
    const { data } = await api.get<FolderNode>(`/documents/folders/${id}`)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar la carpeta')
  }
}

export async function getDeleteImpact(
  id: string,
): Promise<{ folders: number; documents: number }> {
  try {
    const { data } = await api.get<{ folders: number; documents: number }>(
      `/documents/folders/${id}/delete-impact`,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo calcular el impacto de eliminación')
  }
}

export async function createFolder(
  payload: CreateFolderPayload,
): Promise<FolderNode> {
  try {
    const { data } = await api.post<FolderNode>('/documents/folders', payload)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear la carpeta')
  }
}

export async function updateFolder(
  id: string,
  payload: UpdateFolderPayload,
): Promise<FolderNode> {
  try {
    const { data } = await api.patch<FolderNode>(
      `/documents/folders/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar la carpeta')
  }
}

export async function deleteFolder(id: string): Promise<{
  foldersDeleted: number
  documentsDeleted: number
  batchId: string
}> {
  try {
    const { data } = await api.delete<{
      foldersDeleted: number
      documentsDeleted: number
      batchId: string
    }>(`/documents/folders/${id}`)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo eliminar la carpeta')
  }
}

export async function getDocuments(
  params: QueryDocumentsParams,
): Promise<Paginated<DocumentItem>> {
  try {
    const { data } = await api.get<Paginated<DocumentItem>>('/documents', {
      params,
    })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar los documentos')
  }
}

export async function getDocument(id: string): Promise<DocumentItem> {
  try {
    const { data } = await api.get<DocumentItem>(`/documents/${id}`)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar el documento')
  }
}

export async function getDocumentUrl(
  id: string,
  mode: 'preview' | 'download',
): Promise<{
  url: string
  expiresInSeconds: number
  fileName: string
  mimeType: string
}> {
  try {
    const { data } = await api.get<{
      url: string
      expiresInSeconds: number
      fileName: string
      mimeType: string
    }>(`/documents/${id}/url`, { params: { mode } })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo generar el enlace del documento')
  }
}

export async function uploadDocument(
  file: File,
  folderId: string,
  onProgress?: (percent: number) => void,
): Promise<DocumentItem> {
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('folderId', folderId)
    const { data } = await api.post<DocumentItem>('/documents', form, {
      onUploadProgress: (event) => {
        if (!event.total) return
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      },
    })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo subir el documento')
  }
}

export async function updateDocument(
  id: string,
  payload: { fileName?: string; folderId?: string },
): Promise<DocumentItem> {
  try {
    const { data } = await api.patch<DocumentItem>(`/documents/${id}`, payload)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar el documento')
  }
}

export async function deleteDocument(
  id: string,
): Promise<{ id: string; deletedAt: string; batchId: string }> {
  try {
    const { data } = await api.delete<{
      id: string
      deletedAt: string
      batchId: string
    }>(`/documents/${id}`)
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo eliminar el documento')
  }
}

export async function findDocumentUsers(
  search: string,
): Promise<DocumentUser[]> {
  try {
    const { data } = await api.get<DocumentUser[]>('/documents/users', {
      params: { search, limit: 20 },
    })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron buscar usuarios')
  }
}

export async function getTrash(
  params: QueryTrashParams,
): Promise<Paginated<TrashItem>> {
  try {
    const { data } = await api.get<Paginated<TrashItem>>('/documents/trash', {
      params,
    })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar la papelera')
  }
}

export async function restoreDocument(
  id: string,
): Promise<{ id: string; restoredAt: string }> {
  try {
    const { data } = await api.post<{ id: string; restoredAt: string }>(
      `/documents/${id}/restore`,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo restaurar el documento')
  }
}

export async function restoreFolder(
  id: string,
  name?: string,
): Promise<{ batchId: string; foldersRestored: number; documentsRestored: number }> {
  try {
    const { data } = await api.post<{
      batchId: string
      foldersRestored: number
      documentsRestored: number
    }>(`/documents/folders/${id}/restore`, name ? { name } : {})
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo restaurar la carpeta')
  }
}

export async function getPermissions(
  params: QueryPermissionsParams,
): Promise<Paginated<PermissionItem>> {
  try {
    const { data } = await api.get<Paginated<PermissionItem>>(
      '/documents/permissions',
      { params },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar los permisos')
  }
}

export async function setPermission(
  userId: string,
  permission: 'VIEWER' | 'EDITOR' | 'NONE',
): Promise<PermissionItem> {
  try {
    const { data } = await api.put<PermissionItem>(
      `/documents/permissions/${userId}`,
      { permission },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar el permiso')
  }
}

export async function resetPermission(userId: string): Promise<void> {
  try {
    await api.delete(`/documents/permissions/${userId}`)
  } catch (error) {
    handleApiError(error, 'No se pudo restablecer el permiso')
  }
}
