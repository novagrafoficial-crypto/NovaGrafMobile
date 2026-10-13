import apiClient from './ApiClient';

// Mismas rutas que usa la web (ofertaService.js). Requieren sesión de cliente:
// el interceptor de ApiClient ya manda el token. La baseURL ya termina en /api.
export const ofertasApi = {
  getOfertas: async () => (await apiClient.get('/client/ofertas')).data,
  getOfertaDetalle: async (id: number) => (await apiClient.get(`/client/ofertas/${id}`)).data,
  getOfertasByProducto: async (productoId: number | string) =>
    (await apiClient.get(`/client/ofertas/producto/${productoId}`)).data,
};