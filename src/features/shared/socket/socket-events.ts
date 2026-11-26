export const SOCKET_EVENTS = {
  DOCUMENTS_ACCESS_CHANGED: 'documents:access-changed',
  MOBILITY_REQUEST_CHANGED: 'mobility:request-changed',
  MOBILITY_CATALOGS_CHANGED: 'mobility:catalogs-changed',
} as const

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]

export interface SocketEventPayload<T = Record<string, unknown>> {
  type: string
  message: string
  data: T
  timestamp: string
}
