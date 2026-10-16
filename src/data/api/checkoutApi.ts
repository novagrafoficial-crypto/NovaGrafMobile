import apiClient from './ApiClient';

// Mismas rutas que usa Checkout.jsx en la web (la baseURL ya termina en /api)
export const checkoutApi = {
  tiendas: async () => (await apiClient.get('/client/checkout/tiendas-fisicas')).data,
  puntosMedios: async () => (await apiClient.get('/client/checkout/puntos-medios')).data,
  colonias: async () => (await apiClient.get('/client/checkout/colonias')).data,
  metodosPago: async () => (await apiClient.get('/client/checkout/metodos-pago')).data,

  crearPedido: async (body: {
    metodo_entrega_id: number;
    metodo_pago_id: number;
    direccion_envio: string;
    distancia_km: number;
  }) => (await apiClient.post('/client/checkout/crear-pedido', body)).data,
};