import apiClient from './ApiClient';

// Mismas rutas que usa la web (CartContext.jsx).
// La baseURL ya termina en /api, por eso aquí empiezan en /client/...
export const cartApi = {
  getCart: async () => {
    const { data } = await apiClient.get('/client/carrito'); // { items, total }
    return data;
  },

  getCount: async () => {
    const { data } = await apiClient.get('/client/carrito/count'); // { count }
    return data;
  },

  addToCart: async (varianteId: string | number, cantidad: number) => {
    const { data } = await apiClient.post('/client/carrito', {
      variante_id: varianteId,
      cantidad,
    });
    return data;
  },

  updateQuantity: async (detalleId: number, cantidad: number) => {
    const { data } = await apiClient.put(`/client/carrito/${detalleId}`, { cantidad });
    return data;
  },

  removeItem: async (detalleId: number) => {
    const { data } = await apiClient.delete(`/client/carrito/${detalleId}`);
    return data;
  },

  clearCart: async () => {
    const { data } = await apiClient.delete('/client/carrito');
    return data;
  },
};