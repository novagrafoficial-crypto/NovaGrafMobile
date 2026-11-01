import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { SessionStorage } from '../SessionStorage';
import { sessionEvents } from '../sessionEvents';
import { API_URL, API_TIMEOUT } from '@/constants/app';

/**
 * Patrón Singleton: toda la app comparte UNA sola instancia de axios
 * (misma baseURL, mismo timeout, mismo interceptor del token).
 */
class ApiClient {
  private static instance: ApiClient | null = null;
  readonly http: AxiosInstance;

  private constructor() {
    this.http = axios.create({ baseURL: API_URL, timeout: API_TIMEOUT });

    this.http.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const session = await SessionStorage.get();
        if (session?.token && config.headers) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de RESPUESTA: si el token expiró o es inválido (401 Unauthorized),
    // se cierra la sesión y la app regresa al login. Solo aplica a peticiones que
    // llevaban token (un login con contraseña incorrecta no cierra nada).
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        const llevabaToken = Boolean(error?.config?.headers?.Authorization);
        if (error?.response?.status === 401 && llevabaToken) {
          sessionEvents.emitirSesionExpirada();
        }
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance().http;
export default apiClient;
