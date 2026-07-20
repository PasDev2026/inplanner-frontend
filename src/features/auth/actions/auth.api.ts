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

interface LoginUser {
  id: string;
  numero_documento: string;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  email: string | null;
  roles: { sedeId: string; sedeNombre: string; rolCodigo: string }[];
}

interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  usuario: LoginUser;
}

interface JwtPayload {
  sub: string;
  persona_id: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  email?: string;
  roles: { sede_id: string; sede_nombre: string; rol_codigo: string }[];
}

export async function authenticate(formData: { numero_documento: string; password: string }) {
    try {
        const { data } = await api.post<LoginData>('/auth/login', formData)
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        const user: AuthUser = {
          id: data.usuario.id,
          numDocumento: data.usuario.numero_documento,
          nombres: data.usuario.nombres,
          apellidoPaterno: data.usuario.apellido_paterno,
          email: data.usuario.email,
          roles: data.usuario.roles,
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
        const { data } = await api<JwtPayload>('/auth/me')
        return {
            id: data.sub,
            numDocumento: data.numero_documento,
            nombres: data.nombres,
            apellidoPaterno: data.apellido_paterno,
            email: data.email ?? null,
            roles: data.roles.map(r => ({
                sedeId: r.sede_id,
                sedeNombre: r.sede_nombre,
                rolCodigo: r.rol_codigo,
            })),
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
