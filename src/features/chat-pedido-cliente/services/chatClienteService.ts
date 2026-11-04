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
  // El backend ordena por fecha_envio ASC y responde { success, mensajes }.
  getMensajes: async (pedidoId: number): Promise<MensajeChat[]> => {
    const r = await chatClienteApi.getMensajes(pedidoId);
    return (Array.isArray(r?.mensajes) ? r.mensajes : []).map(aMensaje);
  },

  enviar: (pedidoId: number, mensaje: string) => chatClienteApi.enviarMensaje(pedidoId, mensaje.trim()),
};