import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userEditSchema } from "@/features/admin/schemas/user.schema"
import type { UserEditForm } from "@/features/admin/schemas/user.schema"
import { getUserById, updateUserProfileApi } from "@/features/admin/actions/admin.api"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { USERS_KEY, USER_DETAIL_KEY } from "@/features/admin/lib/admin-keys"
import { AREAS_KEY } from "@/features/shared/lib/shared-keys"
import { getAreas } from "@/features/shared/actions/centralizado.api"
import { toast } from "sonner"
import UserFormFields from "./UserFormFields"

type EditUserModalProps = {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function EditUserModal({ isOpen, onClose, userId }: EditUserModalProps) {
  const queryClient = useQueryClient()

  const { data: user, isError, error } = useQuery({
    queryKey: USER_DETAIL_KEY(userId),
    queryFn: () => getUserById(userId),
    enabled: isOpen,
  })

  const { data: areas, isLoading: areasLoading, isError: areasError } = useQuery({
    queryKey: AREAS_KEY,
    queryFn: getAreas,
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      apellido_paterno: "",
      email: "",
      area_id: "",
    },
  })

  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name,
        apellido_paterno: user.apellido_paterno ?? "",
        email: user.email,
        area_id: user.area?.id_area?.toString() ?? "",
      })
    }
  }, [user, isOpen, reset])

  const { mutateAsync } = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: { area_id?: string } }) =>
      updateUserProfileApi(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: USER_DETAIL_KEY(userId) })
      toast.success("Los datos del usuario han sido actualizados correctamente")
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (formData: UserEditForm) => {
    if (!user) return
    const payload: { area_id?: string } = {}
    if (formData.area_id) payload.area_id = formData.area_id
    await mutateAsync({ uid: user.id_user, data: payload })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        {isError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
            Error al cargar los datos del usuario. {error?.message}
            <button onClick={onClose} className="ml-2 underline font-semibold hover:no-underline cursor-pointer">Cerrar</button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <UserFormFields
            register={register}
            errors={errors}
            control={control}
            areas={areas}
            areasLoading={areasLoading}
            areasError={areasError}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
