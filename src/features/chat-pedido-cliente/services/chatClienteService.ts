import { chatClienteApi } from '@/data/api/chatClienteApi';
import type { MensajeChat } from '../models/MensajeChat';

const aMensaje = (m: any): MensajeChat => ({
  id: Number(m.id),
  remitente_id: Number(m.remitente_id),
  remitente_nombre: m.remitente_nombre ?? '',
  mensaje: m.mensaje ?? '',
  fecha_envio: m.fecha_envio ?? null,
});

export const chatClienteService = {
  getMensajes: async (pedidoId: number): Promise<MensajeChat[]> => {
    const r = await chatClienteApi.getPedido(pedidoId);
    return (Array.isArray(r?.chat) ? r.chat : []).map(aMensaje);
  },
  enviar: (pedidoId: number, remitenteId: number, mensaje: string) =>
    chatClienteApi.enviarMensaje({ pedido_cliente_id: pedidoId, remitente_id: remitenteId, mensaje: mensaje.trim() }),
};
