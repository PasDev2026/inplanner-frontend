import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SOCKET_EVENTS } from '@/features/shared/socket/socket-events'
import {
  useSocketConnect,
  useSocketEvent,
} from '@/features/shared/socket/use-socket'
import { documentKeys } from '../lib/document-keys'

/**
 * Mantiene sincronizado el acceso a Documentos cuando un superadministrador
 * cambia el permiso global del usuario.
 */
export function DocumentAccessSocketSync() {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: documentKeys.access,
      type: 'active',
    })
    queryClient.invalidateQueries({ queryKey: documentKeys.tree })
    queryClient.invalidateQueries({ queryKey: documentKeys.folderAll })
    queryClient.invalidateQueries({ queryKey: documentKeys.all })
    queryClient.invalidateQueries({ queryKey: documentKeys.trashAll })
  }, [queryClient])

  useSocketEvent(SOCKET_EVENTS.DOCUMENTS_ACCESS_CHANGED, invalidate)
  useSocketConnect(invalidate)

  return null
}
