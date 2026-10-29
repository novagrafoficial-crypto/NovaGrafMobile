import apiClient from './ApiClient';
import type { RegistroForm } from '@/features/autenticacion/models/Registro';

// Capa de datos: solo habla con el backend, no transforma nada.
export const authApi = {
  loginWithGoogleMobile: async (idToken: string) => {
    const { data } = await apiClient.post('/auth/google/mobile', { idToken });
    return data;
  },

  loginWithCredentials: async (email: string, password: string) => {
    const { data } = await apiClient.post('/users/login', { email, password });
    return data;
  },
  register: async (form: RegistroForm) => {
    const { data } = await apiClient.post('/users/register', form);
    return data;
  },

  verifyOtp: async (id_usuario: string, otp: string) => {
    const { data } = await apiClient.post('/users/verify-otp', { id_usuario, otp });
    return data;
  },

  resendActivationOtp: async (id_usuario: string) => {
    const { data } = await apiClient.post('/users/resend-activation-otp', { id_usuario });
    return data;
  },

    forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/users/forgot-password', { email });
    return data;
  },

  verifyRecoveryOtp: async (id_usuario: string, otp: string) => {
    const { data } = await apiClient.post('/users/verify-recovery-otp', { id_usuario, otp });
    return data;
  },

  resendRecoveryOtp: async (id_usuario: string) => {
    const { data } = await apiClient.post('/users/resend-recovery-otp', { id_usuario });
    return data;
  },

  resetPassword: async (id_usuario: string, otp: string, newPassword: string, confirmPassword: string) => {
    const { data } = await apiClient.post('/users/reset-password', {
      id_usuario,
      otp,
      newPassword,
      confirmPassword,
    });
    return data;
  },
};
