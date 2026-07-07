import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { UserLoginForm } from "@/features/auth/schemas/login.schema";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import InputField from "@/components/ui/InputField";
import { UserIcon, LockIcon } from "@/features/auth/components/login-icons";
import { LoginButton } from "@/features/auth/components/LoginButton";
import type { BackendUserProfile } from "@/features/auth/actions/auth.api";

interface ApiErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function Login() {

  const [showPassword, setShowPassword] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiErrors>({})
  const initialValues: UserLoginForm = {username: '',password: ''}
  const { register, handleSubmit, formState: { errors } } = useForm<UserLoginForm>({ defaultValues: initialValues, resolver: zodResolver(loginSchema) })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get('session')
    if (reason === 'disabled') {
      toast.error('Cuenta desactivada', {
        id: 'session-disabled-toast',
        description: 'Tu cuenta ha sido desactivada por un administrador. No puedes continuar en el sistema.',
      })
    } else if (reason === 'expired') {
      toast.error('Sesión expirada', {
        id: 'session-expired-toast',
        description: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      })
    } else if (reason === 'closed') {
      toast.info('Sesión cerrada', {
        id: 'session-closed-toast',
        description: 'Has cerrado sesión correctamente.',
      })
    }
  },)
  
  const { login } = useAuthContext()

  const {mutate} = useMutation({
    mutationFn: login,
    onError: (error: { message: string }) => {
      toast.error(error.message, { position: 'top-center' });
      setApiErrors({});
    },
    onSuccess: () => {
      const raw = localStorage.getItem('USER_PROFILE')
      if (raw) {
        const user = JSON.parse(raw) as BackendUserProfile
        toast.success(`Bienvenido ${user.fullName}`, {
          description: 'Sesión iniciada correctamente',
        })
      }
      navigate('/projects')
    },
  })

  const handleLogin = (formData: UserLoginForm) => {
    setApiErrors({})
    mutate(formData)
  }

  const clearFieldError = (field: keyof ApiErrors) => {
    setApiErrors(prev => ({ ...prev, [field]: undefined }));
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
        Inicia Sesión
      </h2>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="flex flex-col gap-6"
        noValidate
      >
        <InputField
          id="username"
          label="Usuario"
          type="text"
          placeholder="Ingresa tu usuario"
          icon={<UserIcon />}
          error={errors.username?.message || apiErrors.username}
          {...register("username", {
            onChange: () => clearFieldError('username'),
          })}
        />

        <InputField
          id="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          placeholder="Ingresa tu contraseña"
          icon={<LockIcon />}
          error={errors.password?.message || apiErrors.password}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("password", {
            onChange: () => clearFieldError('password'),
          })}
        />

        <LoginButton type="submit">
          Iniciar Sesión
        </LoginButton>
      </form>
    </>
  )
}