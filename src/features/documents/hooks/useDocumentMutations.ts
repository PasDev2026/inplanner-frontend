import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createFolder,
  deleteDocument,
  deleteFolder,
  resetPermission,
  restoreDocument,
  restoreFolder,
  setPermission,
  updateDocument,
  updateFolder,
  uploadDocument,
} from '../actions/documents.api'
import { documentKeys } from '../lib/document-keys'
import type {
  CreateFolderPayload,
  UpdateFolderPayload,
} from '../lib/types'

function useInvalidateDocuments() {
  const queryClient = useQueryClient()

  return {
    folders: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.tree })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    trash: () => {
      queryClient.invalidateQueries({ queryKey: ['documentsTrash'] })
      queryClient.invalidateQueries({ queryKey: documentKeys.tree })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    permissions: () => {
      queryClient.invalidateQueries({ queryKey: ['documentPermissions'] })
      queryClient.invalidateQueries({ queryKey: documentKeys.access })
    },
  }
}

export function useDocumentMutations() {
  const invalidate = useInvalidateDocuments()
  const queryClient = useQueryClient()

  const createFolderMutation = useMutation({
    mutationFn: (payload: CreateFolderPayload) => createFolder(payload),
    onSuccess: () => {
      invalidate.folders()
      toast.success('Carpeta creada')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateFolderMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateFolderPayload
    }) => updateFolder(id, payload),
    onSuccess: (_data, variables) => {
      invalidate.folders()
      queryClient.invalidateQueries({
        queryKey: documentKeys.folder(variables.id),
      })
      toast.success('Carpeta actualizada')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      invalidate.trash()
      toast.success('Carpeta enviada a la papelera')
    },
    onError: (error) => toast.error(error.message),
  })

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      folderId,
      onProgress,
    }: {
      file: File
      folderId: string
      onProgress?: (percent: number) => void
    }) => uploadDocument(file, folderId, onProgress),
    onSuccess: () => {
      invalidate.folders()
      toast.success('Documento subido')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateDocumentMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { fileName?: string; folderId?: string }
    }) => updateDocument(id, payload),
    onSuccess: () => {
      invalidate.folders()
      toast.success('Documento actualizado')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      invalidate.trash()
      toast.success('Documento enviado a la papelera')
    },
    onError: (error) => toast.error(error.message),
  })

  const restoreDocumentMutation = useMutation({
    mutationFn: (id: string) => restoreDocument(id),
    onSuccess: () => {
      invalidate.trash()
      toast.success('Documento restaurado')
    },
    onError: (error) => toast.error(error.message),
  })

  const restoreFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      restoreFolder(id, name),
    onSuccess: () => {
      invalidate.trash()
      toast.success('Carpeta restaurada')
    },
    onError: (error) => toast.error(error.message),
  })

  const setPermissionMutation = useMutation({
    mutationFn: ({
      userId,
      permission,
    }: {
      userId: string
      permission: 'VIEWER' | 'EDITOR' | 'NONE'
    }) => setPermission(userId, permission),
    onSuccess: () => {
      invalidate.permissions()
      toast.success('Permiso actualizado')
    },
    onError: (error) => toast.error(error.message),
  })

  const resetPermissionMutation = useMutation({
    mutationFn: (userId: string) => resetPermission(userId),
    onSuccess: () => {
      invalidate.permissions()
      toast.success('Permiso restablecido')
    },
    onError: (error) => toast.error(error.message),
  })

  return {
    createFolderMutation,
    updateFolderMutation,
    deleteFolderMutation,
    uploadMutation,
    updateDocumentMutation,
    deleteDocumentMutation,
    restoreDocumentMutation,
    restoreFolderMutation,
    setPermissionMutation,
    resetPermissionMutation,
  }
}
