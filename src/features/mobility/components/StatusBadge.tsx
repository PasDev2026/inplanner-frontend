import { Badge } from '@/components/ui/badge'
import {
  PAYMENT_STATUS_LABELS,
  TRANSFER_STATUS_CLASSES,
  TRANSFER_STATUS_LABELS,
} from '../lib/format'
import type { PaymentStatus, TransferStatus } from '../lib/types'

export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  return (
    <Badge
      variant="outline"
      className={TRANSFER_STATUS_CLASSES[status]}
    >
      {TRANSFER_STATUS_LABELS[status]}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={
        status === 'PAGADO'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
      }
    >
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
