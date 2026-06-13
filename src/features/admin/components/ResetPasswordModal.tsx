import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { resetUserPassword } from "@/features/shared/actions/admin.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type ResetPasswordModalProps = {
  userId: number
  userName: string
  onClose: () => void
}

type ResetPasswordForm = {
  password: string
  password_confirmation: string
}

export default function ResetPasswordModal({ userId, userName, onClose }: ResetPasswordModalProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>()

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: ResetPasswordForm) => resetUserPassword(userId, formData.password),
    onError: (error) => {
      toast.error(error.message || "Ocurrió un error al restablecer la contraseña")
    },
    onSuccess: () => {
      toast.success(`La contraseña de ${userName} fue restablecida correctamente`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
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
          <div className="space-y-2">
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <Input
              id="reset-password"
              type="password"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 8, message: "Debe tener al menos 8 caracteres" },
              })}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">Confirmar contraseña</Label>
            <Input
              id="reset-password-confirm"
              type="password"
              {...register("password_confirmation", {
                required: "Confirma la contraseña",
                validate: (value, formValues) => value === formValues.password || "Las contraseñas no coinciden",
              })}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-destructive font-medium">{errors.password_confirmation.message}</p>
            )}
          </div>

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
