import { format, parseISO } from 'date-fns'
import type {
  MobilityCompanySummary,
  MobilityLocationSummary,
  PaymentStatus,
  TransferEventType,
  TransferStatus,
} from './types'

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  PENDIENTE_JEFATURA: 'Pendiente de jefatura',
  PENDIENTE_FINANZAS: 'Pendiente de Finanzas',
  OK: 'OK',
  SUSTENTADO: 'Sustentado',
  PAGADO: 'Pagado',
  RECHAZADO: 'Rechazado',
}

export const TRANSFER_STATUS_CLASSES: Record<TransferStatus, string> = {
  PENDIENTE_JEFATURA:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  PENDIENTE_FINANZAS:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  SUSTENTADO:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
  PAGADO:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  RECHAZADO:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
}

export const EVENT_LABELS: Record<TransferEventType, string> = {
  CREATED: 'Solicitud creada',
  SUPERVISOR_APPROVED: 'Aprobada por jefatura',
  SUPERVISOR_REJECTED: 'Rechazada por jefatura',
  FINANCE_APPROVED: 'Aprobada por Finanzas',
  FINANCE_REJECTED: 'Rechazada por Finanzas',
  EVIDENCE_UPLOADED: 'Sustento cargado',
  PAYMENT_REGISTERED: 'Pago registrado',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDIENTE: 'Pago pendiente',
  PAGADO: 'Pago registrado',
}

export function formatAmount(value: number | null, currency = 'PEN'): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value.slice(0, 10)), 'dd/MM/yyyy')
  } catch {
    return value
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd/MM/yyyy HH:mm')
  } catch {
    return value
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function companyName(
  company: MobilityCompanySummary | null | undefined,
): string {
  return company?.nombre ?? '—'
}

export function locationName(
  location: MobilityLocationSummary | null | undefined,
): string {
  return location?.nombre ?? '—'
}
