import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { connectSocket, disconnectSocket } from '@/features/shared/lib/socket'

export default function SocketManager() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    useEffect(() => {
        const token = localStorage.getItem('AUTH_TOKEN')
        if (!token) return

        const socket = connectSocket(token)

        const handleForceLogout = () => {
            localStorage.removeItem('AUTH_TOKEN')
            localStorage.removeItem('REFRESH_TOKEN')
            queryClient.removeQueries({ queryKey: ['user'] })
            disconnectSocket()
            navigate('/auth/login?inactivo=true')
        }

        socket.on('force-logout', handleForceLogout)

        return () => {
            socket.off('force-logout', handleForceLogout)
            disconnectSocket()
        }
    }, [])

    return null
}
