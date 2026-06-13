import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

let isRefreshing = false
let pendingQueue: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token!)
    })
    pendingQueue = []
}

api.interceptors.request.use(config => {
    const token = localStorage.getItem('AUTH_TOKEN')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

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
            return new Promise<string>((resolve, reject) => {
                pendingQueue.push({ resolve, reject })
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const refreshToken = localStorage.getItem('REFRESH_TOKEN')
            if (!refreshToken) throw new Error('No refresh token')

            const { data: raw } = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                { refreshToken }
            )

            const unwrapped = raw?.data ?? raw

            localStorage.setItem('AUTH_TOKEN', unwrapped.accessToken)
            processQueue(null, unwrapped.accessToken)
            originalRequest.headers.Authorization = `Bearer ${unwrapped.accessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null)
            localStorage.removeItem('AUTH_TOKEN')
            localStorage.removeItem('REFRESH_TOKEN')
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api