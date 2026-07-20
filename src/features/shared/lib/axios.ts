import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(config => {
    if (config.url?.includes('/auth/refresh')) return config
    const token = localStorage.getItem('auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let pendingQueue: Array<{
    resolve: () => void
    reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve()
    })
    pendingQueue = []
}

api.interceptors.response.use(
    response => {
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const { data, meta } = response.data
            response.data = meta ? { data, meta } : data
        }
        return response
    }
)

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise<void>((resolve, reject) => {
                pendingQueue.push({ resolve, reject })
            }).then(() => {
                return api(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) throw new Error('No refresh token available')

            const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })

            localStorage.setItem('auth_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)

            processQueue(null)
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError)
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('auth_user')
            return Promise.reject(error)
        } finally {
            isRefreshing = false
        }
    }
)

export default api