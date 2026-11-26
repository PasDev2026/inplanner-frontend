import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SOCKET_EVENTS } from '@/features/shared/socket/socket-events'
import {
  useSocketConnect,
  useSocketEvent,
} from '@/features/shared/socket/use-socket'
import {
  MOBILITY_ACCESS_KEY,
  MOBILITY_REQUEST_KEY,
} from '../lib/mobility-keys'

interface MobilityRequestChangedPayload {
  id_request?: string
  status?: string
  event?: string
}

/**
 * Mantiene sincronizadas las solicitudes y catálogos de movilidad cuando otro
 * usuario aprueba, sustenta, paga o cambia una configuración del módulo.
 */
export function MobilitySocketSync() {
  const queryClient = useQueryClient()

  const invalidateRequests = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['mobility', 'requests'] })
    void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
  }, [queryClient])

  useSocketEvent<MobilityRequestChangedPayload>(
    SOCKET_EVENTS.MOBILITY_REQUEST_CHANGED,
    (payload) => {
      invalidateRequests()
      const id = payload.data?.id_request
      if (id) {
        void queryClient.invalidateQueries({
          queryKey: MOBILITY_REQUEST_KEY(id),
        })
      }
    },
  )

  useSocketEvent(SOCKET_EVENTS.MOBILITY_CATALOGS_CHANGED, () => {
    void queryClient.invalidateQueries({ queryKey: ['mobility', 'companies'] })
    void queryClient.invalidateQueries({ queryKey: ['mobility', 'locations'] })
    void queryClient.invalidateQueries({
      queryKey: ['mobility', 'payment-methods'],
    })
    void queryClient.invalidateQueries({
      queryKey: ['mobility', 'payment-sources'],
    })
    void queryClient.invalidateQueries({ queryKey: ['mobility', 'users'] })
    void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
  })

  useSocketConnect(invalidateRequests)

  return null
}
