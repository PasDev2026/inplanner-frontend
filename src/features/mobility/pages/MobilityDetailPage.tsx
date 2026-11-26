import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import PageSpinner from '@/components/ui/PageSpinner'
import {
  formatAmount,
  formatBytes,
  formatDate,
  formatDateTime,
} from '../lib/format'
import { useTransferRequest } from '../hooks/useMobilityQueries'
import { PaymentStatusBadge, TransferStatusBadge } from '../components/StatusBadge'
import ApprovalDialog from '../components/ApprovalDialog'
import EvidenceDialog from '../components/EvidenceDialog'
import PaymentDialog from '../components/PaymentDialog'
import FilePreviewPanel from '../components/FilePreviewPanel'
import FileThumbnail from '../components/FileThumbnail'
import MobilityTimeline from '../components/MobilityTimeline'
import StatusStepper from '../components/StatusStepper'
import DifferenceBadge from '../components/DifferenceBadge'
import { cn } from '@/features/shared/lib/utils'
import type { TransferFile } from '../lib/types'

export default function MobilityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: request, isLoading, isError, error } = useTransferRequest(id)
  const [approvalAction, setApprovalAction] = useState<
    'APROBAR' | 'RECHAZAR' | null
  >(null)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<TransferFile | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <PageSpinner fullPage={false} centered={false} />
      </div>
    )
  }

  if (isError || !request) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? 'No se pudo cargar la solicitud'}
        </p>
        <Link
          to="/movilidad"
          className={buttonVariants({ variant: 'outline', className: 'mt-4' })}
        >
          Volver a movilidad
        </Link>
      </div>
    )
  }

  const evidenceFiles = request.files.filter(
    (file) => file.kind === 'EVIDENCIA',
  )
  const paymentFiles = request.files.filter(
    (file) => file.kind === 'SUSTENTO_DEVOLUCION',
  )
  const evidenceBytes = evidenceFiles.reduce((total, file) => total + file.bytes, 0)
  const rejectedStage: 'JEFATURA' | 'FINANZAS' | null =
    request.status === 'RECHAZADO'
      ? request.events.some((event) => event.event_type === 'FINANCE_REJECTED')
        ? 'FINANZAS'
        : 'JEFATURA'
      : null

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/movilidad"
            aria-label="Volver"
            className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">
                Solicitud de traslado
              </h1>
              <TransferStatusBadge status={request.status} />
              <PaymentStatusBadge status={request.payment.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.origin.nombre} → {request.destination.nombre} ·{" "}
              {formatDate(request.travel_date)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {request.abilities.can_approve && (
            <>
              <Button
                type="button"
                onClick={() => setApprovalAction('APROBAR')}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Aprobar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setApprovalAction('RECHAZAR')}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Rechazar
              </Button>
            </>
          )}
          {request.abilities.can_sustain && (
            <Button type="button" onClick={() => setEvidenceOpen(true)}>
              <FileText className="mr-1.5 h-4 w-4" />
              Cargar sustento
            </Button>
          )}
          {request.abilities.can_pay && (
            <Button type="button" onClick={() => setPaymentOpen(true)}>
              <Wallet className="mr-1.5 h-4 w-4" />
              Registrar pago
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-3">
        <StatusStepper status={request.status} rejectedStage={rejectedStage} />
      </div>

      {request.status === 'PAGADO' || request.status === 'RECHAZADO' ? (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Esta solicitud está cerrada y ya no se puede editar.
        </div>
      ) : null}

      {request.difference !== null && request.difference > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            El monto final supera al aproximado en{" "}
            <strong>
              {formatAmount(request.difference, request.currency)}
            </strong>
            . Finanzas debe revisar la diferencia antes de pagar.
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Solicitante</p>
                <p className="font-medium">
                  {request.requester.nombre_completo}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jefatura</p>
                <p className="font-medium">
                  {request.supervisor?.nombre_completo ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="font-medium">{request.company.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de solicitud
                </p>
                <p className="font-medium">
                  {formatDateTime(request.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Origen</p>
                <p className="font-medium">{request.origin.nombre}</p>
                {request.origin.direccion && (
                  <p className="text-xs text-muted-foreground">
                    {request.origin.direccion}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="font-medium">{request.destination.nombre}</p>
                {request.destination.direccion && (
                  <p className="text-xs text-muted-foreground">
                    {request.destination.direccion}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="whitespace-pre-wrap">{request.reason}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Montos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Monto aproximado
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatAmount(request.estimated_amount, request.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monto final</p>
                <p className="text-lg font-semibold tabular-nums">
                  {formatAmount(request.final_amount, request.currency)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Diferencia</p>
                <DifferenceBadge
                  value={request.difference}
                  currency={request.currency}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Archivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Evidencias del viaje
                  </p>
                  {evidenceFiles.length > 0 && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {evidenceFiles.length}{' '}
                      {evidenceFiles.length === 1 ? 'archivo' : 'archivos'} ·{' '}
                      {formatBytes(evidenceBytes)}
                    </span>
                  )}
                </div>
                {evidenceFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no se ha cargado evidencia.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {evidenceFiles.map((file) => (
                      <FileThumbnail
                        key={file.id_file}
                        requestId={request.id_request}
                        file={file}
                        onPreview={setPreviewFile}
                      />
                    ))}
                  </div>
                )}
              </div>

              {paymentFiles.length > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Documento de abono
                    </p>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {paymentFiles.length}{' '}
                      {paymentFiles.length === 1 ? 'archivo' : 'archivos'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {paymentFiles.map((file) => (
                      <FileThumbnail
                        key={file.id_file}
                        requestId={request.id_request}
                        file={file}
                        onPreview={setPreviewFile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none',
            previewFile
              ? 'max-h-[85vh] w-full opacity-100 xl:w-[320px] xl:shrink-0 2xl:w-[420px]'
              : '-my-2 max-h-0 w-full opacity-0 xl:-mx-2 xl:max-h-none xl:w-0 xl:shrink',
          )}
        >
          {previewFile && (
            <FilePreviewPanel
              requestId={request.id_request}
              file={previewFile}
              onClose={() => setPreviewFile(null)}
            />
          )}
        </div>

        <div
          className={cn(
            'space-y-4 xl:shrink-0',
            previewFile ? 'xl:w-[280px] 2xl:w-[320px]' : 'xl:w-[320px]',
          )}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MobilityTimeline events={request.events} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado</span>
                <PaymentStatusBadge status={request.payment.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Método</span>
                <span>{request.payment.method_label ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Origen</span>
                <span>{request.payment.origin_label ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pagado por</span>
                <span>
                  {request.payment.paid_by?.nombre_completo ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fecha de pago</span>
                <span>{formatDateTime(request.payment.paid_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ApprovalDialog
        open={approvalAction !== null}
        onOpenChange={(open) => {
          if (!open) setApprovalAction(null)
        }}
        requestId={request.id_request}
        action={approvalAction ?? 'APROBAR'}
      />

      <EvidenceDialog
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        requestId={request.id_request}
        estimatedAmount={request.estimated_amount}
        currency={request.currency}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        requestId={request.id_request}
      />

    </div>
  )
}
