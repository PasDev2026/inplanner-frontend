import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000

export function getTokenExp(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return payload.exp ? payload.exp * 1000 : null
    } catch {
        return null
    }
}

let refreshPromise: Promise<string | null> | null = null

const REFRESH_LOCK_NAME = 'inplanner-token-refresh'

function clearAuth() {
    stopTokenRefreshLoop()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    window.dispatchEvent(new Event('auth:expired'))
}

async function refreshNow(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null
    try {
        const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
        if (!data.access_token) return null
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        return data.access_token
    } catch {
        clearAuth()
        return null
    }
}

function isTokenFresh(token: string): boolean {
    const exp = getTokenExp(token)
    return exp !== null && exp - Date.now() >= TOKEN_REFRESH_MARGIN_MS
}

// ponytail: el refresh_token de centralizado es de un solo uso (rotación +
// detección de reuso). Web Locks serializa el refresh entre pestañas para
// evitar que dos pestañas envíen el mismo refresh_token a la vez (reuso).
async function doRefresh(): Promise<string | null> {
    const locks = navigator.locks
    if (!locks) return refreshNow()
    try {
        return await locks.request(REFRESH_LOCK_NAME, { signal: AbortSignal.timeout(15_000) }, async () => {
            const token = localStorage.getItem('auth_token')
            if (token && isTokenFresh(token)) return token
            return refreshNow()
        })
    } catch {
        return null
    }
}

export function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise
    refreshPromise = doRefresh().finally(() => {
        refreshPromise = null
    })
    return refreshPromise
}

api.interceptors.request.use(async config => {
    if (config.url?.includes('/auth/refresh')) return config
    const token = localStorage.getItem('auth_token')
    if (!token) return config

    const exp = getTokenExp(token)
    if (exp === null) {
        config.headers.Authorization = `Bearer ${token}`
        return config
    }

    const isExpired = exp <= Date.now()
    if (!isExpired && exp - Date.now() >= TOKEN_REFRESH_MARGIN_MS) {
        config.headers.Authorization = `Bearer ${token}`
        return config
    }

    const fresh = await refreshAccessToken()
    if (fresh) {
        config.headers.Authorization = `Bearer ${fresh}`
        return config
    }

    if (isExpired) {
        clearAuth()
        return config
    }
    config.headers.Authorization = `Bearer ${token}`
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
        if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
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
            const newToken = await refreshAccessToken()
            if (!newToken) {
                clearAuth()
                throw new Error('No refresh token available')
            }

            processQueue(null)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError)
            return Promise.reject(error)
        } finally {
            isRefreshing = false
        }
    }
)

let bgRefreshInterval: ReturnType<typeof setInterval> | null = null

function handleVisibilityRefresh() {
    if (document.hidden) return
    const token = localStorage.getItem('auth_token')
    if (!token) return
    const exp = getTokenExp(token)
    if (exp !== null && exp - Date.now() < TOKEN_REFRESH_MARGIN_MS) {
        refreshAccessToken()
    }
}

export function startTokenRefreshLoop() {
    if (bgRefreshInterval) return
    bgRefreshInterval = setInterval(async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        const exp = getTokenExp(token)
        if (exp === null) return
        if (exp - Date.now() < TOKEN_REFRESH_MARGIN_MS) {
            await refreshAccessToken()
        }
    }, 15_000)
    // ponytail: el loop de fondo se congela en pestañas en background; al
    // volver a enfocar se refresca al instante si el token está por vencer.
    window.addEventListener('focus', handleVisibilityRefresh)
    document.addEventListener('visibilitychange', handleVisibilityRefresh)
}

export function stopTokenRefreshLoop() {
    if (bgRefreshInterval) {
        clearInterval(bgRefreshInterval)
        bgRefreshInterval = null
    }
    window.removeEventListener('focus', handleVisibilityRefresh)
    document.removeEventListener('visibilitychange', handleVisibilityRefresh)
}

export default api