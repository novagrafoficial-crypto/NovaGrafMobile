import apiClient from './ApiClient';

// Rutas reales del backend (routes/client/chatRoutes.js montado en /api/client/chat):
export const chatClienteApi = {
  getMensajes: async (pedidoId: number) => (await apiClient.get(`/client/chat/${pedidoId}/chat`)).data,

  enviarMensaje: async (pedidoId: number, mensaje: string) =>
    (await apiClient.post(`/client/chat/${pedidoId}/chat`, { mensaje })).data,
};