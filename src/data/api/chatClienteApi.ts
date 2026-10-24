import apiClient from './ApiClient';

// ⚠️ Confirma estas rutas contra el backend / la web del cliente.
// Los mensajes se leen de GET /client/pedidos/:id (campo "chat") y se envían con POST.
export const chatClienteApi = {
  getPedido: async (pedidoId: number) => (await apiClient.get(`/client/pedidos/${pedidoId}`)).data,

  enviarMensaje: async (body: { pedido_cliente_id: number; remitente_id: number; mensaje: string }) =>
    (await apiClient.post('/client/pedidos/chat', body)).data,
};
