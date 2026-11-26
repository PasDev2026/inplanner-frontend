import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  approveTransferRequest,
  assignMobilityUser,
  createCompany,
  createLocation,
  createPaymentMethod,
  createPaymentSource,
  createTransferRequest,
  registerTransferPayment,
  updateCompany,
  updateLocation,
  updatePaymentMethod,
  updatePaymentSource,
  uploadTransferEvidence,
} from '../actions/mobility.api'
import {
  MOBILITY_ACCESS_KEY,
  MOBILITY_PAYMENT_METHODS_KEY,
  MOBILITY_PAYMENT_SOURCES_KEY,
} from '../lib/mobility-keys'
import type {
  AssignMobilityUserPayload,
  CompanyPayload,
  CreateTransferRequestPayload,
  LocationPayload,
  PaymentMethodPayload,
  PaymentSourcePayload,
} from '../lib/types'

function invalidateRequests(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['mobility', 'requests'] })
  void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
}

export function useMobilityMutations() {
  const queryClient = useQueryClient()

  const createRequestMutation = useMutation({
    mutationFn: (payload: CreateTransferRequestPayload) =>
      createTransferRequest(payload),
    onSuccess: (request) => {
      invalidateRequests(queryClient)
      void queryClient.invalidateQueries({
        queryKey: ['mobility', 'request', request.id_request],
      })
      toast.success('Solicitud registrada correctamente')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveMutation = useMutation({
    mutationFn: (input: {
      id: string
      action: 'APROBAR' | 'RECHAZAR'
      comment?: string
    }) =>
      approveTransferRequest(input.id, {
        action: input.action,
        comment: input.comment,
      }),
    onSuccess: (request) => {
      invalidateRequests(queryClient)
      void queryClient.invalidateQueries({
        queryKey: ['mobility', 'request', request.id_request],
      })
      toast.success(
        request.status === 'RECHAZADO'
          ? 'Solicitud rechazada'
          : 'Solicitud aprobada',
      )
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const evidenceMutation = useMutation({
    mutationFn: (input: { id: string; finalAmount: number; files: File[] }) =>
      uploadTransferEvidence(input.id, input.finalAmount, input.files),
    onSuccess: (request) => {
      invalidateRequests(queryClient)
      void queryClient.invalidateQueries({
        queryKey: ['mobility', 'request', request.id_request],
      })
      toast.success('Sustento cargado correctamente')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const paymentMutation = useMutation({
    mutationFn: (input: {
      id: string
      method: string
      origin?: string
      files: File[]
    }) =>
      registerTransferPayment(input.id, {
        method: input.method,
        origin: input.origin,
        files: input.files,
      }),
    onSuccess: (request) => {
      invalidateRequests(queryClient)
      void queryClient.invalidateQueries({
        queryKey: ['mobility', 'request', request.id_request],
      })
      toast.success('Pago registrado. La solicitud quedó cerrada.')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const createCompanyMutation = useMutation({
    mutationFn: (payload: CompanyPayload) => createCompany(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mobility', 'companies'] })
      void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
      toast.success('Empresa creada')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateCompanyMutation = useMutation({
    mutationFn: (input: { id: string; payload: Partial<CompanyPayload> }) =>
      updateCompany(input.id, input.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mobility', 'companies'] })
      void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
      toast.success('Empresa actualizada')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const createLocationMutation = useMutation({
    mutationFn: (payload: LocationPayload) => createLocation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mobility', 'locations'] })
      void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
      toast.success('Ubicación creada')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateLocationMutation = useMutation({
    mutationFn: (input: { id: string; payload: Partial<LocationPayload> }) =>
      updateLocation(input.id, input.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mobility', 'locations'] })
      void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
      toast.success('Ubicación actualizada')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const createPaymentMethodMutation = useMutation({
    mutationFn: (payload: PaymentMethodPayload) =>
      createPaymentMethod(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_METHODS_KEY(),
      })
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_METHODS_KEY(true),
      })
      toast.success('Método de pago creado')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updatePaymentMethodMutation = useMutation({
    mutationFn: (input: {
      id: string
      payload: Partial<PaymentMethodPayload>
    }) => updatePaymentMethod(input.id, input.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_METHODS_KEY(),
      })
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_METHODS_KEY(true),
      })
      toast.success('Método de pago actualizado')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const createPaymentSourceMutation = useMutation({
    mutationFn: (payload: PaymentSourcePayload) =>
      createPaymentSource(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_SOURCES_KEY(),
      })
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_SOURCES_KEY(true),
      })
      toast.success('Origen de pago creado')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updatePaymentSourceMutation = useMutation({
    mutationFn: (input: {
      id: string
      payload: Partial<PaymentSourcePayload>
    }) => updatePaymentSource(input.id, input.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_SOURCES_KEY(),
      })
      void queryClient.invalidateQueries({
        queryKey: MOBILITY_PAYMENT_SOURCES_KEY(true),
      })
      toast.success('Origen de pago actualizado')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const assignUserMutation = useMutation({
    mutationFn: (input: { id: string; payload: AssignMobilityUserPayload }) =>
      assignMobilityUser(input.id, input.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mobility', 'users'] })
      void queryClient.invalidateQueries({ queryKey: MOBILITY_ACCESS_KEY })
      toast.success('Usuario actualizado')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return {
    createRequestMutation,
    approveMutation,
    evidenceMutation,
    paymentMutation,
    createCompanyMutation,
    updateCompanyMutation,
    createLocationMutation,
    updateLocationMutation,
    createPaymentMethodMutation,
    updatePaymentMethodMutation,
    createPaymentSourceMutation,
    updatePaymentSourceMutation,
    assignUserMutation,
  }
}
