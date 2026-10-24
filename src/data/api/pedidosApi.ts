import apiClient from './ApiClient';

export const pedidosApi = {
  getAll: async () => (await apiClient.get('/client/pedidos')).data,
  getById: async (id: number) => (await apiClient.get(`/client/pedidos/${id}`)).data,
  // GET /client/pedidos/:id/disenos -> { success, disenos }
  getDisenos: async (id: number) => (await apiClient.get(`/client/pedidos/${id}/disenos`)).data,
  // GET /client/previas/:pedidoId -> { success, previas, pedido_estado }
  getPrevias: async (id: number) => (await apiClient.get(`/client/previas/${id}`)).data,
};