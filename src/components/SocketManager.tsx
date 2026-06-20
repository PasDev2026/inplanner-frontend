import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { USER_KEY } from '@/features/auth/lib/auth-keys'
import { connectSocket, disconnectSocket } from '@/features/shared/lib/socket'
import { clearUserProfile } from '@/features/shared/lib/token'
import { useActivityTracking } from '@/features/shared/hooks/useActivityTracking'

const FALLBACK_IDLE_MS = 16 * 60 * 1000

export default function SocketManager() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    useActivityTracking()

    useEffect(() => {
        const socket = connectSocket()
        let fallbackTimer: ReturnType<typeof setTimeout> | null = null

        const startFallbackTimer = () => {
            fallbackTimer = setTimeout(() => {
                clearUserProfile()
                queryClient.removeQueries({ queryKey: USER_KEY })
                disconnectSocket()
                navigate('/auth/login?session=expired')
            }, FALLBACK_IDLE_MS)
        }

        const handleForceLogout = (payload: { message: string }) => {
            if (fallbackTimer) clearTimeout(fallbackTimer)
            clearUserProfile()
            queryClient.removeQueries({ queryKey: USER_KEY })
            disconnectSocket()
            const reason = payload.message.includes('desactivada') ? 'disabled'
                         : payload.message.includes('inactividad') ? 'expired'
                         : 'closed'
            navigate(`/auth/login?session=${reason}`)
        }

        startFallbackTimer()
        socket.on('force-logout', handleForceLogout)

        return () => {
            if (fallbackTimer) clearTimeout(fallbackTimer)
            socket.off('force-logout', handleForceLogout)
            disconnectSocket()
        }
    }, [navigate, queryClient])

    return null
}
