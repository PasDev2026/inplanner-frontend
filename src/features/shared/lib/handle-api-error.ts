import { isAxiosError } from 'axios'

export function handleApiError(error: unknown, fallback: string): never {
  if (isAxiosError(error) && error.response) {
    const message = error.response.data?.message ?? error.response.data?.error ?? fallback
    throw new Error(message)
  }
  throw new Error('Error de conexión con el servidor')
}

export function createApiError(error: unknown, fallback: string): Error {
  if (isAxiosError(error) && error.response) {
    const message = error.response.data?.message ?? error.response.data?.error ?? fallback
    return new Error(message)
  }
  return new Error('Error de conexión con el servidor')
}
