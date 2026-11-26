export type TransferStatus =
  | 'PENDIENTE_JEFATURA'
  | 'PENDIENTE_FINANZAS'
  | 'OK'
  | 'SUSTENTADO'
  | 'PAGADO'
  | 'RECHAZADO'

export type TransferEventType =
  | 'CREATED'
  | 'SUPERVISOR_APPROVED'
  | 'SUPERVISOR_REJECTED'
  | 'FINANCE_APPROVED'
  | 'FINANCE_REJECTED'
  | 'EVIDENCE_UPLOADED'
  | 'PAYMENT_REGISTERED'

export type TransferFileKind = 'EVIDENCIA' | 'SUSTENTO_DEVOLUCION'

export type PaymentStatus = 'PENDIENTE' | 'PAGADO'
export type PaymentOriginMode = 'NO' | 'OPCIONAL' | 'OBLIGATORIO'

export interface PaymentMethodCatalog {
  id_method: string
  codigo: string
  nombre: string
  origen_modo: PaymentOriginMode
  requiere_sustento: boolean
  activo: boolean
  orden: number
}

export interface PaymentSourceCatalog {
  id_source: string
  codigo: string
  nombre: string
  activo: boolean
  orden: number
}

export interface PaymentMethodPayload {
  codigo: string
  nombre: string
  origen_modo: PaymentOriginMode
  requiere_sustento?: boolean
  activo?: boolean
  orden?: number
}

export interface PaymentSourcePayload {
  codigo: string
  nombre: string
  activo?: boolean
  orden?: number
}
export type MobilityRole = 'FINANZAS'
export type TransferScope = 'mine' | 'approvals' | 'finance' | 'all'

export interface MobilityUserSummary {
  id_user: string
  nombre_completo: string
  name: string
  apellido_paterno: string | null
  apellido_materno: string | null
  email: string | null
}

export interface MobilityCompanySummary {
  id_company: string
  nombre: string
  ruc: string | null
  activo: boolean
}

export interface MobilityLocationSummary {
  id_location: string
  nombre: string
  direccion: string | null
  activo: boolean
}

export interface MobilityAccess {
  user: MobilityUserSummary
  company: MobilityCompanySummary | null
  supervisor: MobilityUserSummary | null
  roles: {
    es_finanzas: boolean
    es_super_admin: boolean
    es_jefatura: boolean
  }
  puede_crear: boolean
  motivo_no_puede_crear: string | null
  aprobaciones_pendientes: number
  ubicaciones: MobilityLocationSummary[]
}

export interface TransferEndpoint {
  location_id: string | null
  nombre: string
  direccion: string | null
  es_otro: boolean
}

export interface TransferRequestAbilities {
  can_approve: boolean
  can_sustain: boolean
  can_pay: boolean
}

export interface TransferPaymentSummary {
  id_payment: string | null
  status: PaymentStatus
  status_label: string
  method: string | null
  method_label: string | null
  origin: string | null
  origin_label: string | null
}

export interface TransferRequestListItem {
  id_request: string
  travel_date: string
  created_at: string
  status: TransferStatus
  status_label: string
  company: MobilityCompanySummary
  requester: MobilityUserSummary
  supervisor: MobilityUserSummary | null
  origin: TransferEndpoint
  destination: TransferEndpoint
  reason: string
  estimated_amount: number
  final_amount: number | null
  difference: number | null
  currency: string
  payment: TransferPaymentSummary
  abilities: TransferRequestAbilities
}

export interface TransferFile {
  id_file: string
  kind: TransferFileKind
  file_name: string
  mime_type: string
  bytes: number
  created_at: string
  uploaded_by: MobilityUserSummary
}

export interface TransferEvent {
  id_event: string
  event_type: TransferEventType
  event_label: string
  from_status: string | null
  to_status: string | null
  actor: MobilityUserSummary
  comment: string | null
  created_at: string
}

export interface TransferPayment extends TransferPaymentSummary {
  paid_by: MobilityUserSummary | null
  paid_at: string | null
  files: TransferFile[]
}

export interface TransferRequestDetail extends TransferRequestListItem {
  updated_at: string
  closed_at: string | null
  files: TransferFile[]
  events: TransferEvent[]
  payment: TransferPayment
}

export interface MobilityUserAdmin {
  id_user: string
  name: string
  apellido_paterno: string | null
  apellido_materno: string | null
  numero_documento: string
  email: string | null
  estado: boolean
  jefe: MobilityUserSummary | null
  company: MobilityCompanySummary | null
  roles: MobilityRole[]
}

export interface RucLookup {
  ruc: string
  razon_social: string
  direccion?: string | null
  distrito?: string | null
  provincia?: string | null
  departamento?: string | null
  es_persona_natural?: boolean
}

export interface Paginated<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateTransferRequestPayload {
  company_id: string
  travel_date: string
  origin_location_id?: string
  origin_other?: string
  destination_location_id?: string
  destination_other?: string
  reason: string
  estimated_amount: number
  currency?: 'PEN'
}

export interface TransferRequestFilters {
  page?: number
  limit?: number
  scope?: TransferScope
  status?: TransferStatus | ''
  company_id?: string
  search?: string
  date_from?: string
  date_to?: string
}

export interface CompanyPayload {
  nombre: string
  ruc?: string | null
  activo?: boolean
}

export interface LocationPayload {
  nombre: string
  direccion?: string | null
  activo?: boolean
}

export interface AssignMobilityUserPayload {
  jefe_id?: string | null
  company_id?: string | null
  roles?: MobilityRole[]
}
