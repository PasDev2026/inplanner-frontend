import axios from 'axios'

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
                `${import.meta.env.VITE_API_URL}auth/refresh-token`,
                {},
                { withCredentials: true }
            )

            processQueue(null)
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError)
            localStorage.removeItem('USER_PROFILE')
            return Promise.reject(error)
        } finally {
            isRefreshing = false
        }
    }
)

export default api