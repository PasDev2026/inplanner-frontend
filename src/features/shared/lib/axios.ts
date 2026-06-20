import axios from 'axios'
import { getCsrfToken } from './token'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
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

api.interceptors.request.use(
    config => {
        const csrfToken = getCsrfToken()
        if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method)) {
            config.headers['X-CSRF-Token'] = csrfToken
        }
        return config
    }
)

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
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                {},
                { withCredentials: true }
            )

            processQueue(null)
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError)
            localStorage.removeItem('USER_PROFILE')
            window.location.href = '/auth/login?session=expired'
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api