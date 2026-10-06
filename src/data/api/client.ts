// src/data/api/client.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  // ⚡ COLOCA AQUÍ LA URL PÚBLICA DE TU BACKEND DESPLEGADO:
  baseURL: 'https://nova-graf-zbdt.onrender.com',
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const stored = await SecureStore.getItemAsync('user_session');
    if (stored) {
      const user = JSON.parse(stored);
      if (config.headers) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
