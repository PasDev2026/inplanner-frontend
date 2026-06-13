import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL
    return apiUrl.replace(/\/api\/.*$/, '')
}

export const connectSocket = (token: string): Socket => {
    if (socket?.connected) {
        return socket
    }

    socket = io(getSocketUrl(), {
        auth: { token },
        transports: ['polling', 'websocket']
    })

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message)
    })

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

export const getSocket = (): Socket | null => socket
