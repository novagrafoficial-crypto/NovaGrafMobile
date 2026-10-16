import apiClient from './ApiClient';

export const pagoApi = {
  getPedido: async (pedidoId: number) =>
    (await apiClient.get(`/client/pedidos/${pedidoId}`)).data,

  registrarComprobante: async (
    pedidoId: number,
    body: { tipo_pago: string; monto: number; comprobante_url: string; notas_admin: string | null }
  ) => (await apiClient.post(`/client/pedidos/${pedidoId}/comprobante`, body)).data,
};