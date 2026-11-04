export interface MensajeChat {
  id: number;
  remitente_id: number;
  remitente_nombre: string;
  mensaje: string;
  fecha_envio: string | null;
}