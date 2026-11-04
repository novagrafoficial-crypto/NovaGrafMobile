// Fila de ventas.notificaciones (la crean los disparadores de la BD o notificarAdmins del backend).
export interface NotificacionAdmin {
  id: number;
  pedido_id: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string | null;
}