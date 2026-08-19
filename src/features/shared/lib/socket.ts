import { io, Socket } from 'socket.io-client'
import { refreshAccessToken } from '@/features/shared/lib/axios'

let socket: Socket | null = null
let authRetries = 0

const MAX_AUTH_RETRIES = 5

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL
    return apiUrl.replace(/\/api\/.*$/, '')
}

export const connectSocket = (): Socket => {
    if (socket?.connected) {
        return socket
    }

    if (socket) {
        socket.disconnect()
        socket = null
    }

    const token = localStorage.getItem('auth_token') ?? ''

    socket = io(getSocketUrl(), {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        auth: { token },
    })

    socket.on('connect', () => {
        authRetries = 0
        socket?.emit('ping')
    })

    socket.on('connect_error', async (error) => {
        console.error('Socket connection error:', error.message)
        if (authRetries >= MAX_AUTH_RETRIES) {
            disconnectSocket()
            return
        }
        // ponytail: el token del socket queda fijo al conectar; si el JWT rota
        // o vence, se refresca y se actualiza socket.auth antes del próximo
        // intento automático de reconexión (evita la flood de 401).
        const fresh = await refreshAccessToken()
        if (!fresh || !socket) {
            disconnectSocket()
            return
        }
        authRetries++
        socket.auth = { token: fresh }
    })

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
    authRetries = 0
}

export const getSocket = (): Socket | null => socket