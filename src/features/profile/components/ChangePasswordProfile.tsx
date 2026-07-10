import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCurrentUserPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import type { UpdateCurrentUserPasswordForm } from "@/features/auth/schemas/reset-password.schema";
import { useMutation } from "@tanstack/react-query";
import { changePasswordProfile } from "@/features/profile/actions/profile.api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { InputForm } from "@/features/shared/components/form/InputForm";
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
    formState: { errors },
  } = useForm<UpdateCurrentUserPasswordForm>({ defaultValues: initialValues, resolver: zodResolver(updateCurrentUserPasswordSchema) });

  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: (formData: UpdateCurrentUserPasswordForm) =>
      changePasswordProfile({ current_password: formData.current_password, new_password: formData.password }),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      toast.success(data.message)
      navigate('/projects')
    },
  });

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const handleChangePassword = (formData: UpdateCurrentUserPasswordForm) => mutate(formData);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Cambiar Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza tu contraseña
        </p>

        <form
          onSubmit={handleSubmit(handleChangePassword)}
          className="mt-10 space-y-6"
          noValidate
        >
          <InputForm
            label="Contraseña actual"
            name="current_password"
            register={register}
            errors={errors}
            type={showPasswords.current_password ? "text" : "password"}
            suffix={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current_password: !prev.current_password,
                  }))
                }
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPasswords.current_password ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <InputForm
            label="Nueva contraseña"
            name="password"
            register={register}
            errors={errors}
            type={showPasswords.password ? "text" : "password"}
            suffix={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    password: !prev.password,
                  }))
                }
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPasswords.password ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <InputForm
            label="Repetir contraseña"
            name="password_confirmation"
            register={register}
            errors={errors}
            type={showPasswords.password_confirmation ? "text" : "password"}
            suffix={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    password_confirmation: !prev.password_confirmation,
                  }))
                }
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPasswords.password_confirmation ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <Button type="submit" className="w-full">
            Cambiar Password
          </Button>
        </form>
      </div>
    </>
  );
}
