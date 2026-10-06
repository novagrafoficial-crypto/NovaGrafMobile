import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const stored = await SecureStore.getItemAsync('user_session');
    if (stored) {
      const sessionData = JSON.parse(stored);
      // Inyecta el JWT transparente para que el backend reconozca la sesión móvil
      if (sessionData && sessionData.token && config.headers) {
        config.headers.Authorization = `Bearer ${sessionData.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
