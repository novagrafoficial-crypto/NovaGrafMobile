import { notificacionesApi } from '@/data/api/notificacionesApi';
import type { Notificacion } from '../models/Notificacion';

const aNotificacion = (r: any): Notificacion => ({
  id: Number(r.id),
  pedido_id: r.pedido_id != null ? Number(r.pedido_id) : null,
  tipo: r.tipo,
  titulo: r.titulo ?? '',
  mensaje: r.mensaje ?? '',
  leida: !!r.leida,
  creado_en: r.creado_en,
});

export const notificacionesService = {
  async getAll(): Promise<{ notificaciones: Notificacion[]; noLeidas: number }> {
    const data = await notificacionesApi.getAll();
    return {
      notificaciones: (data.notificaciones ?? []).map(aNotificacion),
      noLeidas: Number(data.noLeidas) || 0,
    };
  },
  marcarLeida: (id: number) => notificacionesApi.marcarLeida(id),
  marcarTodasLeidas: () => notificacionesApi.marcarTodasLeidas(),
  eliminar: (id: number) => notificacionesApi.eliminar(id),
};