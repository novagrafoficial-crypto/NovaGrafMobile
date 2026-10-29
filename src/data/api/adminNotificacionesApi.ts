import apiClient from './ApiClient';

// Endpoints que YA existen en el backend (routes/admin/pedidos):
//   GET   /api/admin/pedidos/notificaciones/:adminId  -> solo las NO leídas, ordenadas por creado_en DESC
//   PATCH /api/admin/pedidos/notificaciones/:id/leer  -> leida = true, leida_en = NOW()
export const adminNotificacionesApi = {
  getNoLeidas: async (adminId: number) =>
    (await apiClient.get(`/admin/pedidos/notificaciones/${adminId}`)).data,

  marcarLeida: async (id: number) =>
    (await apiClient.patch(`/admin/pedidos/notificaciones/${id}/leer`)).data,
};