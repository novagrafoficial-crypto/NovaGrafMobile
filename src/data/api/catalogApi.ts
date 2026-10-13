import apiClient from './ApiClient';
import { cartApi } from '@/data/api/cartApi';
// Capa de datos del catálogo del cliente: solo habla con el backend.
export const catalogApi = {
  getProducts: async () => {
    const { data } = await apiClient.get('/client/productos/catalogo');
    return data;
  },

  getProductDetail: async (id: string | number) => {
    const { data } = await apiClient.get(`/client/productos/${id}`);
    return data;
  },

  getProductPortfolio: async (id: string | number) => {
    const { data } = await apiClient.get(`/client/productos/${id}/portafolio`);
    return data;
  },

  requestDesign: async (solicitud: Record<string, unknown>) => {
    const { data } = await apiClient.post('/client/pedidos/solicitar', solicitud);
    return data;
  },
  addToCart: (varianteId: string | number, cantidad: number) =>
  cartApi.addToCart(varianteId, cantidad),
};
