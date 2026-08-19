import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  authenticate as authenticateApi,
  logoutApi,
  getSedeSlug,
} from '@/features/auth/actions/auth.api'
import { startTokenRefreshLoop, stopTokenRefreshLoop } from '@/features/shared/lib/axios'
import type { AuthUser, LoginCredentials } from '@/features/auth/actions/auth.api'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')
    if (raw && token) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    startTokenRefreshLoop()
    return () => stopTokenRefreshLoop()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authUser = await authenticateApi(credentials)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    queryClient.clear()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    navigate(`/${getSedeSlug()}/auth/login?session=closed`, { replace: true })
  }, [queryClient, navigate])

  useEffect(() => {
    const onExpired = () => {
      queryClient.clear()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
      setUser(null)
      navigate(`/${getSedeSlug()}/auth/login?session=expired`, { replace: true })
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [queryClient, navigate])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
