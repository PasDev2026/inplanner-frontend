export const MOBILITY_ACCESS_KEY = ['mobility', 'access'] as const

export const MOBILITY_REQUESTS_KEY = (filters?: Record<string, unknown>) =>
  ['mobility', 'requests', filters ?? {}] as const

export const MOBILITY_REQUEST_KEY = (id: string) =>
  ['mobility', 'request', id] as const

export const MOBILITY_COMPANIES_KEY = (includeInactive?: boolean) =>
  ['mobility', 'companies', { includeInactive: Boolean(includeInactive) }] as const

export const MOBILITY_LOCATIONS_KEY = (includeInactive?: boolean) =>
  ['mobility', 'locations', { includeInactive: Boolean(includeInactive) }] as const

export const MOBILITY_USERS_KEY = (params?: Record<string, unknown>) =>
  ['mobility', 'users', params ?? {}] as const

export const MOBILITY_PAYMENT_METHODS_KEY = (includeInactive?: boolean) =>
  [
    'mobility',
    'payment-methods',
    { includeInactive: Boolean(includeInactive) },
  ] as const

export const MOBILITY_PAYMENT_SOURCES_KEY = (includeInactive?: boolean) =>
  [
    'mobility',
    'payment-sources',
    { includeInactive: Boolean(includeInactive) },
  ] as const

export const MOBILITY_FILE_URL_KEY = (requestId: string, fileId: string) =>
  ['mobility', 'file-url', requestId, fileId] as const
