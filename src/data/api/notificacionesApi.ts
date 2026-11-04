import apiClient from './ApiClient';

export const notificacionesApi = {
  getAll: async () => (await apiClient.get('/client/notificaciones')).data,
  marcarLeida: async (id: number) => (await apiClient.put(`/client/notificaciones/${id}/leer`)).data,
  marcarTodasLeidas: async () => (await apiClient.put('/client/notificaciones/leer-todas')).data,
  eliminar: async (id: number) => (await apiClient.delete(`/client/notificaciones/${id}`)).data,
};