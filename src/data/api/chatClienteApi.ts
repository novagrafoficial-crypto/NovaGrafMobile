import apiClient from './ApiClient';

// Rutas reales del backend (routes/client/chatRoutes.js montado en /api/client/chat):
//   GET  /api/client/chat/:id/chat  -> { success, mensajes }
//   POST /api/client/chat/:id/chat  body { mensaje } -> el remitente sale del token (JWT)
export const chatClienteApi = {
  getMensajes: async (pedidoId: number) => (await apiClient.get(`/client/chat/${pedidoId}/chat`)).data,

  enviarMensaje: async (pedidoId: number, mensaje: string) =>
    (await apiClient.post(`/client/chat/${pedidoId}/chat`, { mensaje })).data,
};