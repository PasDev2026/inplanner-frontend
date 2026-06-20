import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  authenticate as authenticateApi,
  logoutApi,
  getUserApi,
} from '@/features/shared/actions/auth.api'
import type { BackendUserProfile } from '@/features/shared/actions/auth.api'
import { fetchCsrfToken, clearUserProfile } from '@/features/shared/lib/token'
import { USER_KEY } from '@/features/auth/lib/auth-keys'

interface AuthContextType {
  user: BackendUserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    fetchCsrfToken()

    const profile = localStorage.getItem('USER_PROFILE')
    if (!profile) {
      setIsLoading(false)
      return
    }

    try {
      const cached = localStorage.getItem('USER_PROFILE')
      if (cached) {
        setUser(JSON.parse(cached))
      }
    } catch {
      // cached profile may be invalid JSON, ignore
    }

    getUserApi()
      .then((userData) => {
        if (userData) {
          setUser(userData)
          localStorage.setItem('USER_PROFILE', JSON.stringify(userData))
        }
      })
      .catch(() => {
        localStorage.removeItem('USER_PROFILE')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const response = await authenticateApi(credentials)
    localStorage.setItem('USER_PROFILE', JSON.stringify(response.user))
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    queryClient.removeQueries({ queryKey: USER_KEY })
    setUser(null)
    clearUserProfile()
  }, [queryClient])

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
