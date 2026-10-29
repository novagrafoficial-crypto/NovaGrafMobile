import apiClient from './ApiClient';

export interface DisenoEnvio {
  variante_id: number;
  archivo_url: string;
  notas_cliente: string;
}

export const disenoApi = {
  enviarDisenos: async (pedidoId: number, disenos: DisenoEnvio[]) =>
    (await apiClient.post(`/client/pedidos/${pedidoId}/disenos`, { disenos })).data,
};