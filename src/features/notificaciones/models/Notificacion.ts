// Tipos que genera el backend (ventas.notificaciones.tipo).
export type NotificacionTipo =
  | 'ESTADO_CAMBIADO'
  | 'PAGO_APROBADO'
  | 'PAGO_RECHAZADO'
  | 'PREVIA_ENVIADA'
  | 'MENSAJE_NUEVO'
  | string;

export interface Notificacion {
  id: number;
  pedido_id: number | null;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creado_en: string;
}