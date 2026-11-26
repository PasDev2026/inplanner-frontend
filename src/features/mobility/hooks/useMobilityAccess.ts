import { useQuery } from '@tanstack/react-query'
import { getMobilityAccess } from '../actions/mobility.api'
import { MOBILITY_ACCESS_KEY } from '../lib/mobility-keys'

export function useMobilityAccess() {
  return useQuery({
    queryKey: MOBILITY_ACCESS_KEY,
    queryFn: getMobilityAccess,
    staleTime: 60_000,
  })
}
