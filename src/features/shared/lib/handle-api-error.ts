import { isAxiosError } from 'axios'

export function handleApiError(error: unknown, fallback: string): never {
  if (isAxiosError(error) && error.response) {
    const message = error.response.data?.message ?? error.response.data?.error ?? fallback
    throw new Error(message)
  }
  throw new Error('Error de conexión con el servidor')
}

export function createApiError(error: unknown, fallback: string, field?: string): Error & { field?: string } {
  if (isAxiosError(error) && error.response) {
    const message = error.response.data?.message ?? error.response.data?.error ?? fallback
    const err = new Error(message) as Error & { field?: string }
    if (field) err.field = field
    return err
  }
  return new Error('Error de conexión con el servidor')
}
