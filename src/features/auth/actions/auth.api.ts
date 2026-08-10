import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { handleApiError, createApiError } from "@/features/shared/lib/handle-api-error";

export interface AuthUser {
  id: string;
  numDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  email: string | null;
  roles: { sedeId: string; sedeNombre: string; rolCodigo: string }[];
}

export interface LoginCredentials {
  numero_documento: string;
  password: string;
  sede_slug: string;
}

export function getSedeSlug(): string {
  return localStorage.getItem('sede_slug') ?? (import.meta.env.VITE_DEFAULT_SEDE as string | undefined) ?? 'hub'
}

interface UserSede {
  sede_id: string;
  sede_nombre: string;
  sede_slug: string;
  rol_codigo: string;
}

interface LoginUser {
  id: string;
  nombre_completo: string;
  email: string | null;
  pais_codigo: string;
  sede_activa: UserSede;
  otras_sedes: UserSede[];
}

interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  usuario: LoginUser;
}

interface JwtClaims {
  sub: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  email?: string;
  sede_activa: UserSede;
  otras_sedes: UserSede[];
}

function decodeJwt(token: string): JwtClaims | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as JwtClaims;
  } catch {
    return null;
  }
}

function toRoles(claims: JwtClaims): AuthUser["roles"] {
  return [claims.sede_activa, ...(claims.otras_sedes ?? [])]
    .filter((s) => s?.sede_id)
    .map((s) => ({
      sedeId: s.sede_id,
      sedeNombre: s.sede_nombre,
      rolCodigo: s.rol_codigo,
    }));
}

export async function authenticate(formData: LoginCredentials) {
    try {
        const { data } = await api.post<LoginData>('/auth/login', formData)
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('sede_slug', formData.sede_slug)
        const claims = decodeJwt(data.access_token)
        const user: AuthUser = {
          id: data.usuario.id ?? claims?.sub ?? '',
          numDocumento: claims?.numero_documento ?? '',
          nombres: claims?.nombres ?? '',
          apellidoPaterno: claims?.apellido_paterno ?? '',
          email: data.usuario.email,
          roles: claims ? toRoles(claims) : [],
        }
        localStorage.setItem('auth_user', JSON.stringify(user))
        return user
    } catch (error) {
        if(isAxiosError(error) && error.response){
            const err = createApiError(error, 'Error de conexión con el servidor', error.response.data.field || 'general');
            throw err;
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function getUserApi(): Promise<AuthUser | undefined> {
    try {
        const { data } = await api<JwtClaims & { email: string | null }>('/auth/me')
        return {
            id: data.sub,
            numDocumento: data.numero_documento ?? '',
            nombres: data.nombres ?? '',
            apellidoPaterno: data.apellido_paterno ?? '',
            email: data.email ?? null,
            roles: toRoles(data),
        }
    } catch (error) {
        handleApiError(error, 'Error de conexión con el servidor')
    }
}

export async function logoutApi() {
    try {
        await api.post('/auth/logout')
    } catch (err) {
        console.error('Logout error:', err)
    }
}
