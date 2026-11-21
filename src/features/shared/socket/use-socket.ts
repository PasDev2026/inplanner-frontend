import { useContext, useEffect, useRef } from 'react'
import { SocketContext } from './socket.context'
import type {
  SocketEventName,
  SocketEventPayload,
} from './socket-events'

function useLatest<T>(value: T) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  })

  return ref
}

export function useSocket() {
  return useContext(SocketContext)
}

/**
 * Escucha un evento del socket compartido mientras el componente esté montado.
 * El callback se guarda en un ref para no perder eventos entre renders.
 */
export function useSocketEvent<T = Record<string, unknown>>(
  event: SocketEventName,
  callback: (payload: SocketEventPayload<T>) => void,
) {
  const { socket } = useContext(SocketContext)
  const callbackRef = useLatest(callback)

  useEffect(() => {
    if (!socket) return

    const handler = (payload: SocketEventPayload<T>) =>
      callbackRef.current(payload)

    socket.on(event, handler)
    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, callbackRef])
}

/**
 * Ejecuta el callback cada vez que el socket conecta, incluida la conexión
 * inicial. Sirve para recuperar cambios que ocurrieron antes de que el socket
 * terminara de conectarse.
 */
export function useSocketConnect(callback: () => void) {
  const { socket } = useContext(SocketContext)
  const callbackRef = useLatest(callback)

  useEffect(() => {
    if (!socket) return

    const handler = () => callbackRef.current()
    socket.on('connect', handler)
    if (socket.connected) callbackRef.current()

    return () => {
      socket.off('connect', handler)
    }
  }, [socket, callbackRef])
}

/**
 * Ejecuta el callback al reconectar el socket, no en la conexión inicial.
 * Se mantiene para módulos que ya cargaron sus datos al montar.
 */
export function useSocketReconnect(callback: () => void) {
  const { socket } = useContext(SocketContext)
  const callbackRef = useLatest(callback)

  useEffect(() => {
    if (!socket) return

    let skipInitialConnect = !socket.connected
    const handler = () => {
      if (skipInitialConnect) {
        skipInitialConnect = false
        return
      }
      callbackRef.current()
    }

    socket.on('connect', handler)
    return () => {
      socket.off('connect', handler)
    }
  }, [socket, callbackRef])
}
