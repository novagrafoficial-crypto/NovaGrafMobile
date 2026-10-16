import apiClient from './ApiClient';

export const pedidosApi = {
  getAll: async () => (await apiClient.get('/client/pedidos')).data,
  getById: async (id: number) => (await apiClient.get(`/client/pedidos/${id}`)).data,
};