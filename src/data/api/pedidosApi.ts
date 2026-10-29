import apiClient from './ApiClient';

export const pedidosApi = {
  getAll: async () => (await apiClient.get('/client/pedidos')).data,
  getById: async (id: number) => (await apiClient.get(`/client/pedidos/${id}`)).data,
  // GET /client/pedidos/:id/disenos -> { success, disenos }
  getDisenos: async (id: number) => (await apiClient.get(`/client/pedidos/${id}/disenos`)).data,
  // GET /client/previas/:pedidoId -> { success, previas, pedido_estado }
  getPrevias: async (id: number) => (await apiClient.get(`/client/previas/${id}`)).data,
  // POST /client/previas/:pedidoId/aprobar  { numero_previa } -> { success, previa, nuevo_estado }
  aprobarPrevia: async (pedidoId: number, numeroPrevia: number) =>
    (await apiClient.post(`/client/previas/${pedidoId}/aprobar`, { numero_previa: numeroPrevia })).data,
  // POST /client/previas/:pedidoId/rechazar  { numero_previa, comentario } -> { success, previa, rechazadas_total }
  rechazarPrevia: async (pedidoId: number, numeroPrevia: number, comentario: string) =>
    (await apiClient.post(`/client/previas/${pedidoId}/rechazar`, { numero_previa: numeroPrevia, comentario })).data,
};