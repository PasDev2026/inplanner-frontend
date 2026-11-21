import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { AUTH_CHANGED_EVENT } from '@/features/shared/lib/auth-events'
import { connectSocket, disconnectSocket } from '@/features/shared/lib/socket'
import { SocketContext } from './socket.context'

/**
 * Dueño único de la conexión WebSocket de la aplicación.
 *
 * La conexión se crea cuando existe `auth_token` en localStorage y se rehace o
 * cierra cuando AuthProvider dispara `auth:changed` (login, logout o expiración).
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const syncConnection = () => {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        disconnectSocket()
        setSocket(null)
        setIsConnected(false)
        return
      }

      setSocket(connectSocket())
    }

    syncConnection()
    window.addEventListener(AUTH_CHANGED_EVENT, syncConnection)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncConnection)
      disconnectSocket()
    }
  }, [])

  useEffect(() => {
    if (!socket) {
      setIsConnected(false)
      return
    }

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    setIsConnected(socket.connected)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
