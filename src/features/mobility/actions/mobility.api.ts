import api from '@/features/shared/lib/axios'
import { handleApiError } from '@/features/shared/lib/handle-api-error'
import type {
  AssignMobilityUserPayload,
  CompanyPayload,
  CreateTransferRequestPayload,
  LocationPayload,
  MobilityAccess,
  MobilityCompanySummary,
  MobilityLocationSummary,
  MobilityUserAdmin,
  Paginated,
  PaymentMethodCatalog,
  PaymentMethodPayload,
  PaymentSourceCatalog,
  PaymentSourcePayload,
  RucLookup,
  TransferRequestDetail,
  TransferRequestFilters,
  TransferRequestListItem,
} from '../lib/types'

export async function getMobilityAccess(): Promise<MobilityAccess> {
  try {
    const { data } = await api.get<MobilityAccess>('/mobility/me')
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar tus permisos de movilidad')
  }
}

export async function getTransferRequests(
  filters: TransferRequestFilters,
): Promise<Paginated<TransferRequestListItem>> {
  try {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      scope: filters.scope ?? 'mine',
    }
    if (filters.status) params.status = filters.status
    if (filters.company_id) params.company_id = filters.company_id
    if (filters.search) params.search = filters.search
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to

    const { data } = await api.get<Paginated<TransferRequestListItem>>(
      '/mobility/requests',
      { params },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar las solicitudes')
  }
}

export async function getTransferRequest(
  id: string,
): Promise<TransferRequestDetail> {
  try {
    const { data } = await api.get<TransferRequestDetail>(
      `/mobility/requests/${id}`,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar la solicitud')
  }
}

export async function createTransferRequest(
  payload: CreateTransferRequestPayload,
): Promise<TransferRequestDetail> {
  try {
    const { data } = await api.post<TransferRequestDetail>(
      '/mobility/requests',
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear la solicitud')
  }
}

export async function approveTransferRequest(
  id: string,
  payload: { action: 'APROBAR' | 'RECHAZAR'; comment?: string },
): Promise<TransferRequestDetail> {
  try {
    const { data } = await api.post<TransferRequestDetail>(
      `/mobility/requests/${id}/approvals`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar la solicitud')
  }
}

export async function uploadTransferEvidence(
  id: string,
  finalAmount: number,
  files: File[],
): Promise<TransferRequestDetail> {
  try {
    const formData = new FormData()
    formData.append('final_amount', String(finalAmount))
    files.forEach((file) => formData.append('files', file))

    const { data } = await api.post<TransferRequestDetail>(
      `/mobility/requests/${id}/evidence`,
      formData,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo cargar el sustento')
  }
}

export async function registerTransferPayment(
  id: string,
  payload: {
    method: string
    origin?: string
    files: File[]
  },
): Promise<TransferRequestDetail> {
  try {
    const formData = new FormData()
    formData.append('method', payload.method)
    if (payload.origin) formData.append('origin', payload.origin)
    payload.files.forEach((file) => formData.append('files', file))

    const { data } = await api.post<TransferRequestDetail>(
      `/mobility/requests/${id}/payment`,
      formData,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo registrar el pago')
  }
}

export async function getTransferFileUrl(
  requestId: string,
  fileId: string,
  mode: 'preview' | 'download' = 'preview',
): Promise<{ url: string; fileName: string; mimeType: string }> {
  try {
    const { data } = await api.get<{
      url: string
      fileName: string
      mimeType: string
    }>(`/mobility/requests/${requestId}/files/${fileId}/url`, {
      params: { mode },
    })
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo abrir el archivo')
  }
}

export async function getCompanies(
  includeInactive = false,
): Promise<MobilityCompanySummary[]> {
  try {
    const { data } = await api.get<MobilityCompanySummary[]>(
      '/mobility/companies',
      { params: { incluir_inactivos: includeInactive } },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar las empresas')
  }
}

export async function createCompany(
  payload: CompanyPayload,
): Promise<MobilityCompanySummary> {
  try {
    const { data } = await api.post<MobilityCompanySummary>(
      '/mobility/companies',
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear la empresa')
  }
}

export async function updateCompany(
  id: string,
  payload: Partial<CompanyPayload>,
): Promise<MobilityCompanySummary> {
  try {
    const { data } = await api.patch<MobilityCompanySummary>(
      `/mobility/companies/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar la empresa')
  }
}

export async function lookupRuc(ruc: string): Promise<RucLookup> {
  try {
    const { data } = await api.get<RucLookup>(
      `/mobility/companies/ruc/${ruc}`,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo consultar el RUC en SUNAT')
  }
}

export async function getLocations(
  includeInactive = false,
): Promise<MobilityLocationSummary[]> {
  try {
    const { data } = await api.get<MobilityLocationSummary[]>(
      '/mobility/locations',
      { params: { incluir_inactivos: includeInactive } },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar las ubicaciones')
  }
}

export async function createLocation(
  payload: LocationPayload,
): Promise<MobilityLocationSummary> {
  try {
    const { data } = await api.post<MobilityLocationSummary>(
      '/mobility/locations',
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear la ubicación')
  }
}

export async function updateLocation(
  id: string,
  payload: Partial<LocationPayload>,
): Promise<MobilityLocationSummary> {
  try {
    const { data } = await api.patch<MobilityLocationSummary>(
      `/mobility/locations/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar la ubicación')
  }
}

export async function getPaymentMethods(
  includeInactive = false,
): Promise<PaymentMethodCatalog[]> {
  try {
    const { data } = await api.get<PaymentMethodCatalog[]>(
      '/mobility/payment-methods',
      { params: { incluir_inactivos: includeInactive } },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar los métodos de pago')
  }
}

export async function createPaymentMethod(
  payload: PaymentMethodPayload,
): Promise<PaymentMethodCatalog> {
  try {
    const { data } = await api.post<PaymentMethodCatalog>(
      '/mobility/payment-methods',
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear el método de pago')
  }
}

export async function updatePaymentMethod(
  id: string,
  payload: Partial<PaymentMethodPayload>,
): Promise<PaymentMethodCatalog> {
  try {
    const { data } = await api.patch<PaymentMethodCatalog>(
      `/mobility/payment-methods/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar el método de pago')
  }
}

export async function getPaymentSources(
  includeInactive = false,
): Promise<PaymentSourceCatalog[]> {
  try {
    const { data } = await api.get<PaymentSourceCatalog[]>(
      '/mobility/payment-sources',
      { params: { incluir_inactivos: includeInactive } },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar los orígenes de pago')
  }
}

export async function createPaymentSource(
  payload: PaymentSourcePayload,
): Promise<PaymentSourceCatalog> {
  try {
    const { data } = await api.post<PaymentSourceCatalog>(
      '/mobility/payment-sources',
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo crear el origen de pago')
  }
}

export async function updatePaymentSource(
  id: string,
  payload: Partial<PaymentSourcePayload>,
): Promise<PaymentSourceCatalog> {
  try {
    const { data } = await api.patch<PaymentSourceCatalog>(
      `/mobility/payment-sources/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar el origen de pago')
  }
}

export async function getMobilityUsers(params: {
  page?: number
  limit?: number
  search?: string
}): Promise<Paginated<MobilityUserAdmin>> {
  try {
    const { data } = await api.get<Paginated<MobilityUserAdmin>>(
      '/mobility/admin/users',
      { params },
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudieron cargar los usuarios')
  }
}

export async function assignMobilityUser(
  id: string,
  payload: AssignMobilityUserPayload,
): Promise<MobilityUserAdmin> {
  try {
    const { data } = await api.patch<MobilityUserAdmin>(
      `/mobility/admin/users/${id}`,
      payload,
    )
    return data
  } catch (error) {
    handleApiError(error, 'No se pudo actualizar el usuario')
  }
}
