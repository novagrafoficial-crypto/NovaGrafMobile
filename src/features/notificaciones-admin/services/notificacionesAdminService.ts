import { adminNotificacionesApi } from '@/data/api/adminNotificacionesApi';
import type { NotificacionAdmin } from '../models/NotificacionAdmin';

// El backend solo devuelve las no leídas, por eso leida siempre es false aquí.
const aNotificacion = (n: any): NotificacionAdmin => ({
  id: Number(n.id),
  pedido_id: n.pedido_id != null ? Number(n.pedido_id) : null,
  tipo: n.tipo ?? '',
  titulo: n.titulo ?? '',
  mensaje: n.mensaje ?? '',
  leida: Boolean(n.leida),
  fecha: n.creado_en ?? null,
});

export const notificacionesAdminService = {
  getNoLeidas: async (adminId: number): Promise<NotificacionAdmin[]> => {
    const r = await adminNotificacionesApi.getNoLeidas(adminId);
    return (Array.isArray(r) ? r : []).map(aNotificacion);
  },

  marcarLeida: (id: number) => adminNotificacionesApi.marcarLeida(id),

  // No existe endpoint "leer todas": se marca cada una en paralelo.
  marcarTodas: (ids: number[]) => Promise.all(ids.map((id) => adminNotificacionesApi.marcarLeida(id))),
};