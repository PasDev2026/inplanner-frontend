import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileFormSchema } from "@/features/auth/schemas/auth.schema"
import type { UserProfileForm } from "@/features/auth/schemas/auth.schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { USER_KEY } from "@/features/auth/lib/auth-keys"
import { updateProfile } from "@/features/shared/actions/profile.api"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type ProfileFormProps = {
  data: { name: string; email: string }
}

export default function ProfileForm({ data }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileForm>({ defaultValues: { name: data.name, email: data.email }, resolver: zodResolver(profileFormSchema) })

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: USER_KEY })
    },
  })

  const handleEditProfile = (formData: UserProfileForm) => {
    mutate(formData)
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza tu información personal
        </p>

        <form
          onSubmit={handleSubmit(handleEditProfile)}
          className="mt-10 space-y-6"
          noValidate
        >
          <div>
            <Label htmlFor="name">
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              className="mt-1"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label>
              DNI
            </Label>
            <Input
              type="text"
              value={"dni" in data ? (data as { dni: string }).dni : 'No registrado'}
              className="mt-1"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="email">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              className="mt-1"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full">
            Guardar Cambios
          </Button>
        </form>
      </div>
    </>
  )
}
