import apiClient from './ApiClient';

// Mismo endpoint que usa la web: POST /api/admin/pedidos/chat.
// Los mensajes se leen con GET /admin/pedidos/:id, que ya devuelve { ..., chat: [...] }.
export const adminChatApi = {
  getPedido: async (pedidoId: number) => (await apiClient.get(`/admin/pedidos/${pedidoId}`)).data,

  enviarMensaje: async (body: { pedido_cliente_id: number; remitente_id: number; mensaje: string }) =>
    (await apiClient.post('/admin/pedidos/chat', body)).data,
};