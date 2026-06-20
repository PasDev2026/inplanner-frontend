let csrfToken: string | null = null

export function getCsrfToken(): string | null {
  return csrfToken
}

export function setCsrfToken(token: string) {
  csrfToken = token
}

export async function fetchCsrfToken() {
  if (csrfToken) return csrfToken
  try {
    const { default: api } = await import('@/features/shared/lib/axios')
    const { data } = await api.get<{ csrfToken: string }>('/auth/csrf-token')
    csrfToken = data.csrfToken
    return csrfToken
  } catch {
    return null
  }
}

export function clearUserProfile() {
  localStorage.removeItem('USER_PROFILE')
}
