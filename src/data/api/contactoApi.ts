import apiClient from './ApiClient';

// Rutas públicas (no requieren sesión). La baseURL ya termina en /api.
export const contactoApi = {
  getContactos: async () => (await apiClient.get('/contactos')).data,
  getRedes: async () => (await apiClient.get('/redes-sociales')).data,
  getUbicaciones: async () => (await apiClient.get('/ubicacion')).data,
};