import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatAmount,
  formatDate,
} from '../lib/format'
import type { TransferRequestListItem } from '../lib/types'
import { PaymentStatusBadge, TransferStatusBadge } from './StatusBadge'

export default function TransferRequestTable({
  items,
}: {
  items: TransferRequestListItem[]
}) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Viaje</TableHead>
          <TableHead>Solicitante</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead className="text-right">Aprox.</TableHead>
          <TableHead className="text-right">Final</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pago</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id_request}>
            <TableCell className="whitespace-nowrap text-xs">
              {formatDate(item.travel_date)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="text-sm font-medium">
                {item.requester.nombre_completo}
              </div>
              {item.supervisor && (
                <div className="text-xs text-muted-foreground">
                  Jefe: {item.supervisor.nombre_completo}
                </div>
              )}
            </TableCell>
            <TableCell className="text-xs">{item.company.nombre}</TableCell>
            <TableCell className="min-w-52 text-xs">
              {item.origin.nombre}
              <span className="mx-1 text-muted-foreground">→</span>
              {item.destination.nombre}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-xs">
              {formatAmount(item.estimated_amount, item.currency)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-xs">
              {item.final_amount === null ? (
                '—'
              ) : (
                <span
                  className={
                    item.difference && item.difference > 0
                      ? 'font-medium text-amber-700 dark:text-amber-400'
                      : ''
                  }
                >
                  {formatAmount(item.final_amount, item.currency)}
                </span>
              )}
            </TableCell>
            <TableCell>
              <TransferStatusBadge status={item.status} />
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={item.payment.status} />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Ver detalle"
                onClick={() => navigate(`/movilidad/${item.id_request}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
