import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  authenticate as authenticateApi,
  logoutApi,
  getUserApi,
} from '@/features/auth/actions/auth.api'
import type { AuthUser } from '@/features/auth/actions/auth.api'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { numero_documento: string; password: string }) => Promise<void>
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
    if (!raw) {
      setIsLoading(false)
      return
    }

    getUserApi()
      .then((userData) => {
        if (userData) {
          setUser(userData)
          localStorage.setItem('auth_user', JSON.stringify(userData))
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (credentials: { numero_documento: string; password: string }) => {
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
    navigate('/auth/login?session=closed', { replace: true })
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
