import { useState } from "react";
import { useForm } from "react-hook-form";
import { UpdateCurrentUserPasswordForm } from "@/features/auth/schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { changePasswordProfile } from "@/features/shared/actions/profile.api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ChangePasswordProfile() {
  const initialValues: UpdateCurrentUserPasswordForm = {
    current_password: "",
    password: "",
    password_confirmation: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: (formData: UpdateCurrentUserPasswordForm) =>
      changePasswordProfile({ current_password: formData.current_password, new_password: formData.password }),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      toast.success(data.message)
    },
  });

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const password = watch("password");
  const handleChangePassword = (formData: UpdateCurrentUserPasswordForm) => mutate(formData);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900">Cambiar Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Actualiza tu contraseña
        </p>

        <form
          onSubmit={handleSubmit(handleChangePassword)}
          className="mt-10 space-y-6"
          noValidate
        >
          <div>
            <Label htmlFor="current_password">
              Contraseña actual
            </Label>
            <div className="relative mt-1">
              <Input
                id="current_password"
                type={showPasswords.current_password ? "text" : "password"}
                className="pr-10"
                {...register("current_password", {
                  required: "El password actual es obligatorio",
                })}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current_password: !prev.current_password,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current_password ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-xs text-red-500 mt-1">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Nueva contraseña
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPasswords.password ? "text" : "password"}
                className="pr-10"
                {...register("password", {
                  required: "El Nuevo Password es obligatorio",
                  minLength: {
                    value: 8,
                    message: "El Password debe ser mínimo de 8 caracteres",
                  },
                })}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    password: !prev.password,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.password ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="password_confirmation">
              Repetir contraseña
            </Label>

            <div className="relative mt-1">
              <Input
                id="password_confirmation"
                type={showPasswords.password_confirmation ? "text" : "password"}
                className="pr-10"
                {...register("password_confirmation", {
                  required: "Este campo es obligatorio",
                  validate: (value) =>
                    value === password || "Los Passwords no son iguales",
                })}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    password_confirmation: !prev.password_confirmation,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.password_confirmation ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Cambiar Password
          </Button>
        </form>
      </div>
    </>
  );
}
