import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  authenticate as authenticateApi,
  logoutApi,
  getUserApi,
} from '@/features/auth/actions/auth.api'
import type { BackendUserProfile } from '@/features/auth/actions/auth.api'

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
  const navigate = useNavigate()

  useEffect(() => {
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
    queryClient.clear()
    localStorage.removeItem('USER_PROFILE')
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
