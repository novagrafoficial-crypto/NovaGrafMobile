import apiClient from './ApiClient';

// Rutas públicas (no requieren sesión). La baseURL ya termina en /api.
export const nosotrosApi = {
  getMision: async () => (await apiClient.get('/public/mision')).data,
  getVision: async () => (await apiClient.get('/public/vision')).data,
  getValores: async () => (await apiClient.get('/public/valores')).data,
  getAntecedentes: async () => (await apiClient.get('/public/antecedentes')).data,
};