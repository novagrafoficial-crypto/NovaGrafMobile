import apiClient from './ApiClient';

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
};
