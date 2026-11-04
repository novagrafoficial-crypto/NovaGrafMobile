import apiClient from './ApiClient';

// La baseURL ya termina en /api, por eso aquí empieza en /admin/...
// Mismos endpoints que usa la web (AdminPedidos.jsx / AdminPedidoDetalle.jsx).
export const adminPedidosApi = {
  getAll: async () => (await apiClient.get('/admin/pedidos')).data,

  getById: async (id: number) => (await apiClient.get(`/admin/pedidos/${id}`)).data,

  actualizarEstado: async (id: number, estado: string) =>
    (await apiClient.patch(`/admin/pedidos/${id}/estado`, { estado })).data,

  actualizarPago: async (pagoId: number, estado_pago: string, notas_admin: string) =>
    (await apiClient.patch(`/admin/pedidos/pagos/${pagoId}`, { estado_pago, notas_admin })).data,

  subirPrevia: async (body: { pedido_cliente_id: number; numero_previa: number; imagen_url: string }) =>
    (await apiClient.post('/admin/pedidos/previas', body)).data,
};