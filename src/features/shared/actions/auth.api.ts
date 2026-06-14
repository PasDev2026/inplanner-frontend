import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { CheckPasswordForm } from "@/features/auth/schemas/auth.schema";

export interface BackendUserProfile {
    idUser: number;
    username: string;
    email: string;
    name: string;
    apellido_paterno: string;
    fullName: string;
    roles: string[];
}

export interface LoginResponse {
    user: BackendUserProfile;
    accessToken: string;
    refreshToken: string;
}

export async function authenticate(formData: { username: string; password: string }) {
    try {
        const url = '/auth/login'
        const { data } = await api.post<LoginResponse>(url, formData)
        localStorage.setItem('AUTH_TOKEN', data.accessToken)
        localStorage.setItem('REFRESH_TOKEN', data.refreshToken)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            const err = new Error(error.response.data.error || error.response.data.message);
            (err as any).field = error.response.data.field || 'general';
            throw err;
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function getUserApi() {
    try {
        const { data } = await api<{ user: BackendUserProfile }>('/auth/me')
        return data.user
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}



export async function checkPasswordApi(formData:CheckPasswordForm) {
    const token = localStorage.getItem('AUTH_TOKEN')
    try {
        const url = `/auth/check-password`
        const { data } = await api.post<string>(url, formData,{headers: {Authorization: `Bearer ${token}`}})
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function logoutApi() {
    const refreshToken = localStorage.getItem('REFRESH_TOKEN')
    if (!refreshToken) return
    try {
        await api.post('/auth/logout', { refreshToken })
    } catch {
        // Si falla (token ya revocado, red caída), igual procedemos con logout local
    }
}
