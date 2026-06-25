import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputForm } from "@/features/shared/components/form/InputForm"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema"
import type { ResetPasswordForm } from "@/features/auth/schemas/reset-password.schema"
import { resetUserPassword } from "@/features/admin/actions/admin.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { USERS_KEY } from "@/features/admin/lib/admin-keys"
import { toast } from "sonner"

type ResetPasswordModalProps = {
  userId: number
  userName: string
  onClose: () => void
}

export default function ResetPasswordModal({ userId, userName, onClose }: ResetPasswordModalProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: ResetPasswordForm) => resetUserPassword(userId, formData.password),
    onError: (error) => {
      toast.error(error.message || "Ocurrió un error al restablecer la contraseña")
    },
    onSuccess: () => {
      toast.success(`La contraseña de ${userName} fue restablecida correctamente`)
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      onClose()
    },
  })

  const onSubmit = (formData: ResetPasswordForm) => mutate(formData)

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Nueva contraseña para <span className="font-semibold text-foreground">{userName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputForm
            label="Nueva contraseña"
            name="password"
            register={register}
            errors={errors}
            type="password"
          />

          <InputForm
            label="Confirmar contraseña"
            name="password_confirmation"
            register={register}
            errors={errors}
            type="password"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Restableciendo..." : "Restablecer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
