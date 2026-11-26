import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getCompanies,
  getLocations,
  getMobilityUsers,
  getPaymentMethods,
  getPaymentSources,
  getTransferRequest,
  getTransferRequests,
} from '../actions/mobility.api'
import {
  MOBILITY_COMPANIES_KEY,
  MOBILITY_LOCATIONS_KEY,
  MOBILITY_PAYMENT_METHODS_KEY,
  MOBILITY_PAYMENT_SOURCES_KEY,
  MOBILITY_REQUEST_KEY,
  MOBILITY_REQUESTS_KEY,
  MOBILITY_USERS_KEY,
} from '../lib/mobility-keys'
import type { TransferRequestFilters } from '../lib/types'

export function useTransferRequests(filters: TransferRequestFilters) {
  return useQuery({
    queryKey: MOBILITY_REQUESTS_KEY(filters as Record<string, unknown>),
    queryFn: () => getTransferRequests(filters),
    placeholderData: keepPreviousData,
  })
}

export function useTransferRequest(id: string | undefined) {
  return useQuery({
    queryKey: MOBILITY_REQUEST_KEY(id ?? ''),
    queryFn: () => getTransferRequest(id as string),
    enabled: Boolean(id),
  })
}

export function useCompanies(includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: MOBILITY_COMPANIES_KEY(includeInactive),
    queryFn: () => getCompanies(includeInactive),
    enabled,
    staleTime: 60_000,
  })
}

export function useLocations(includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: MOBILITY_LOCATIONS_KEY(includeInactive),
    queryFn: () => getLocations(includeInactive),
    enabled,
    staleTime: 60_000,
  })
}

export function useMobilityUsers(
  params: { page?: number; limit?: number; search?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: MOBILITY_USERS_KEY(params as Record<string, unknown>),
    queryFn: () => getMobilityUsers(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function usePaymentMethods(
  includeInactive = false,
  enabled = true,
) {
  return useQuery({
    queryKey: MOBILITY_PAYMENT_METHODS_KEY(includeInactive),
    queryFn: () => getPaymentMethods(includeInactive),
    enabled,
    staleTime: 60_000,
  })
}

export function usePaymentSources(
  includeInactive = false,
  enabled = true,
) {
  return useQuery({
    queryKey: MOBILITY_PAYMENT_SOURCES_KEY(includeInactive),
    queryFn: () => getPaymentSources(includeInactive),
    enabled,
    staleTime: 60_000,
  })
}
