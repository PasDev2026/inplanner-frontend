import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useActivityTracking } from '@/features/shared/hooks/useActivityTracking'
import { AUTH_CHANGED_EVENT } from '@/features/shared/lib/auth-events'
import { useSocket } from '@/features/shared/socket/use-socket'
import { getSedeSlug } from '@/features/auth/actions/auth.api'

const FALLBACK_IDLE_MS = 8 * 60 * 60 * 1000

function clearSession() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export default function SocketManager() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { socket } = useSocket()
  useActivityTracking()

  useEffect(() => {
    if (!socket) return

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null

    const startFallbackTimer = () => {
      fallbackTimer = setTimeout(() => {
        clearSession()
        queryClient.clear()
        navigate(`/${getSedeSlug()}/auth/login?session=expired`)
      }, FALLBACK_IDLE_MS)
    }

    const handleForceLogout = (payload: { message: string }) => {
      if (fallbackTimer) clearTimeout(fallbackTimer)
      clearSession()
      queryClient.clear()
      const reason = payload.message.includes('desactivada')
        ? 'disabled'
        : payload.message.includes('inactividad')
          ? 'expired'
          : 'closed'
      navigate(`/${getSedeSlug()}/auth/login?session=${reason}`)
    }

    startFallbackTimer()
    socket.on('force-logout', handleForceLogout)

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer)
      socket.off('force-logout', handleForceLogout)
    }
  }, [navigate, queryClient, socket])

  return null
}
