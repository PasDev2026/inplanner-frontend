import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Car } from 'lucide-react'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import PageSpinner from '@/components/ui/PageSpinner'
import { useMobilityAccess } from '../hooks/useMobilityAccess'
import { useMobilityMutations } from '../hooks/useMobilityMutations'
import { formatAmount, todayISO } from '../lib/format'
import type { CreateTransferRequestPayload } from '../lib/types'

const schema = z
  .object({
    company_id: z.string().min(1, 'Selecciona una empresa'),
    travel_date: z.string().min(1, 'Selecciona la fecha del viaje'),
    origin_location_id: z.string().min(1, 'Selecciona el origen'),
    destination_location_id: z.string().min(1, 'Selecciona el destino'),
    reason: z
      .string()
      .min(3, 'El motivo debe tener al menos 3 caracteres')
      .max(1000, 'El motivo no debe exceder 1000 caracteres'),
    estimated_amount: z.coerce
      .number({ invalid_type_error: 'Ingresa un monto válido' })
      .positive('El monto debe ser mayor que 0'),
  })
  .superRefine((values, ctx) => {
    if (
      values.origin_location_id &&
      values.destination_location_id &&
      values.origin_location_id === values.destination_location_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destination_location_id'],
        message: 'El destino debe ser distinto del origen',
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function MobilityCreatePage() {
  const navigate = useNavigate()
  const { data: access, isLoading } = useMobilityAccess()
  const { createRequestMutation } = useMobilityMutations()

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: '',
      travel_date: todayISO(),
      origin_location_id: '',
      destination_location_id: '',
      reason: '',
      estimated_amount: 0,
    },
  })

  useEffect(() => {
    if (access?.company) {
      setValue('company_id', access.company.id_company)
    }
  }, [access?.company, setValue])

  const estimatedAmount = watch('estimated_amount')

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <PageSpinner fullPage={false} centered={false} />
      </div>
    )
  }

  if (!access?.puede_crear) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <Car className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="text-lg font-semibold">
              No puedes crear solicitudes todavía
            </h1>
            <p className="text-sm text-muted-foreground">
              {access?.motivo_no_puede_crear ??
                'Tu usuario no tiene la configuración necesaria.'}
            </p>
            <Link
              to="/movilidad"
              className={buttonVariants({ variant: 'outline' })}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver a movilidad
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = async (values: FormValues) => {
    const payload: CreateTransferRequestPayload = {
      company_id: values.company_id,
      travel_date: values.travel_date,
      reason: values.reason.trim(),
      estimated_amount: values.estimated_amount,
      currency: 'PEN',
      origin_location_id: values.origin_location_id,
      destination_location_id: values.destination_location_id,
    }

    try {
      const request = await createRequestMutation.mutateAsync(payload)
      navigate(`/movilidad/${request.id_request}`)
    } catch {
      // El hook ya muestra el error.
    }
  }

  const locations = access.ubicaciones

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Link
          to="/movilidad"
          aria-label="Volver"
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva solicitud de traslado</h1>
          <p className="text-sm text-muted-foreground">
            Registra el viaje antes de realizarlo. Quedará pendiente de tu
            jefatura.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <input type="hidden" {...register('company_id')} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de la solicitud</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Empresa</Label>
              <Input
                value={access.company?.nombre ?? ''}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Solo puedes solicitar con la empresa a la que perteneces.
              </p>
              {errors.company_id && (
                <p className="text-xs text-destructive">
                  {errors.company_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="travel_date" className="text-xs font-medium">
                Fecha del viaje
              </Label>
              <Input
                id="travel_date"
                type="date"
                min={todayISO()}
                {...register('travel_date')}
              />
              {errors.travel_date && (
                <p className="text-xs text-destructive">
                  {errors.travel_date.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Punto de origen</Label>
              <Controller
                control={control}
                name="origin_location_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value)
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Seleccionar origen">
                        {
                          locations.find(
                            (location) =>
                              location.id_location === field.value,
                          )?.nombre
                        }
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {locations.map((location) => (
                          <Select.Item
                            key={location.id_location}
                            value={location.id_location}
                          >
                            {location.nombre}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select>
                )}
              />
              {errors.origin_location_id && (
                <p className="text-xs text-destructive">
                  {errors.origin_location_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Punto de destino</Label>
              <Controller
                control={control}
                name="destination_location_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value)
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Seleccionar destino">
                        {
                          locations.find(
                            (location) =>
                              location.id_location === field.value,
                          )?.nombre
                        }
                      </Select.Value>
                    </Select.Trigger>
                    <Select.Popup>
                      <Select.List>
                        {locations.map((location) => (
                          <Select.Item
                            key={location.id_location}
                            value={location.id_location}
                          >
                            {location.nombre}
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select>
                )}
              />
              {errors.destination_location_id && (
                <p className="text-xs text-destructive">
                  {errors.destination_location_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reason" className="text-xs font-medium">
                Motivo del viaje
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Describe brevemente el motivo del traslado"
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estimated_amount" className="text-xs font-medium">
                Monto aproximado (PEN)
              </Label>
              <Input
                id="estimated_amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                {...register('estimated_amount')}
              />
              {estimatedAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Se mostrará como {formatAmount(Number(estimatedAmount), 'PEN')}
                </p>
              )}
              {errors.estimated_amount && (
                <p className="text-xs text-destructive">
                  {errors.estimated_amount.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link
            to="/movilidad"
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={createRequestMutation.isPending}>
            {createRequestMutation.isPending
              ? 'Guardando...'
              : 'Registrar solicitud'}
          </Button>
        </div>
      </form>
    </div>
  )
}
