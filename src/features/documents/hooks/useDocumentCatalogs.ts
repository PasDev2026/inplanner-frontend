import { useQuery } from '@tanstack/react-query'
import { getAreas, getSedes } from '@/features/shared/actions/centralizado.api'

export function useDocumentSedes(enabled = true) {
  return useQuery({
    queryKey: ['centralizado', 'sedes'],
    queryFn: getSedes,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useDocumentAreas(enabled = true) {
  return useQuery({
    queryKey: ['documents', 'areas'],
    queryFn: getAreas,
    enabled,
    staleTime: 5 * 60_000,
  })
}
