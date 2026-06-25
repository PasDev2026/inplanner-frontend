import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { handleApiError, createApiError } from "@/features/shared/lib/handle-api-error";
import { CheckPasswordForm } from "@/features/auth/schemas/reset-password.schema";

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
}

export async function authenticate(formData: { username: string; password: string }) {
    try {
        const url = '/auth/login'
        const { data } = await api.post<LoginResponse>(url, formData)
        localStorage.setItem('USER_PROFILE', JSON.stringify(data.user))
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            const err = createApiError(error, 'Error de conexión con el servidor');
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
        handleApiError(error, 'Error de conexión con el servidor')
    }
}



export async function checkPasswordApi(formData:CheckPasswordForm) {
    try {
        const url = `/auth/check-password`
        const { data } = await api.post<string>(url, formData)
        return data
    } catch (error) {
        handleApiError(error, 'Error de conexión con el servidor')
    }
}

export async function logoutApi() {
    try {
        await api.post('/auth/logout')
    } catch {
    }
}
