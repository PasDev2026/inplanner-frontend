import { isAxiosError } from "axios";
import api from "@/features/shared/lib/axios";
import { CheckPasswordForm, ConfirmToken, ForgotPasswordForm, NewPasswordForm, RequestConfirmationCodeForm, UserRegistrationForm } from "@/features/auth/schemas/auth.schema";

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

export async function createAccount(formData:UserRegistrationForm) {
    try {
        const url = '/auth/register'
        const data = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function confirmAccount(formData:ConfirmToken) {
    try {
        const url = '/auth/confirmation-account'
        const {data} = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function requestConfirmationCodeForm(formData:RequestConfirmationCodeForm) {
    try {
        const url = '/auth/reset-token'
        const {data} = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
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

export async function changePassword(formData:ForgotPasswordForm) {
    try {
        const url = '/auth/change-password'
        const {data} = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}

export async function validateToken(formData:ConfirmToken) {
    try {
        const url = '/auth/validate-token'
        const {data} = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
        }
        throw new Error('Error de conexión con el servidor');
    }
}


export async function updatePasswordWithToken({formData, token}:{formData: NewPasswordForm, token: ConfirmToken['token']}) {
 
    try {
        const url = `/auth/change-password/${token}`
        const {data} = await api.post<string>(url, formData)
        return data
    } catch (error) {
        if(isAxiosError(error) && error.response){
            throw new Error(error.response.data.message);
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
