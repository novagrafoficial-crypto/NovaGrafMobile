import type { PreviaAdmin } from '../models/PedidoAdmin';

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconoAdmin = ComponentProps<typeof Ionicons>['name'];

// Estados del pedido en el orden en que avanza (incluye VERIFICANDO_PAGO_FINAL,
// que pone el backend cuando el cliente sube su pago final).
export const ESTADOS_PEDIDO = [
  'PENDIENTE_VERIFICACION',
  'EN_DISENO',
  'EN_REVISION',
  'PREVIAS_ENVIADAS',
  'EN_PRODUCCION',
  'PENDIENTE_PAGO_FINAL',
  'VERIFICANDO_PAGO_FINAL',
  'ENVIADO',
  'CANCELADO',
] as const;

interface InfoEstado {
  etiqueta: string;
  icono: IconoAdmin;
  bg: string;
  fg: string;
  /** Qué tiene que hacer el ADMIN en este estado (null = esperar al cliente o nada) */
  accion: string | null;
}

const INFO: Record<string, InfoEstado> = {
  PENDIENTE_VERIFICACION: { etiqueta: 'Verificar anticipo', icono: 'time-outline', bg: '#FEF3C7', fg: '#92400E', accion: 'Revisar anticipo' },
  EN_DISENO: { etiqueta: 'Esperando diseño', icono: 'color-palette-outline', bg: '#E0F2FE', fg: '#075985', accion: null },
  EN_REVISION: { etiqueta: 'Crear previa', icono: 'brush-outline', bg: '#FFEDD5', fg: '#9A3412', accion: 'Enviar previa' },
  PREVIAS_ENVIADAS: { etiqueta: 'Previa enviada', icono: 'eye-outline', bg: '#EDE9FE', fg: '#5B21B6', accion: null },
  EN_PRODUCCION: { etiqueta: 'En producción', icono: 'construct-outline', bg: '#E6F2EF', fg: '#0F4F51', accion: 'Marcar como listo' },
  PENDIENTE_PAGO_FINAL: { etiqueta: 'Esperando pago final', icono: 'cash-outline', bg: '#FCE7F3', fg: '#9D174D', accion: null },
  VERIFICANDO_PAGO_FINAL: { etiqueta: 'Verificar pago final', icono: 'search-outline', bg: '#FEF3C7', fg: '#92400E', accion: 'Revisar pago final' },
  ENVIADO: { etiqueta: 'Enviado', icono: 'checkmark-circle-outline', bg: '#DCFCE7', fg: '#166534', accion: null },
  CANCELADO: { etiqueta: 'Cancelado', icono: 'close-circle-outline', bg: '#F4F4F5', fg: '#52525B', accion: null },
};

const info = (estado: string): InfoEstado =>
  INFO[estado] ?? {
    etiqueta: estado.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    icono: 'ellipse-outline',
    bg: '#F4F4F5',
    fg: '#3F3F46',
    accion: null,
  };

export const colorEstado = (estado: string) => ({ bg: info(estado).bg, fg: info(estado).fg });
export const etiquetaEstado = (estado: string) => info(estado).etiqueta;
export const iconoEstado = (estado: string) => info(estado).icono;
/** Texto de la acción que le toca al admin (para la lista y el inicio) */
export const accionAdmin = (estado: string) => info(estado).accion;

export const colorEstadoPago = (estado: string) => {
  if (estado === 'APROBADO') return { bg: '#DCFCE7', fg: '#166534', icono: 'checkmark-circle' as IconoAdmin, texto: 'Aprobado' };
  if (estado === 'RECHAZADO') return { bg: '#FEE2E2', fg: '#991B1B', icono: 'close-circle' as IconoAdmin, texto: 'Rechazado' };
  return { bg: '#FEF3C7', fg: '#92400E', icono: 'time' as IconoAdmin, texto: 'Por revisar' };
};

/** Nombre amigable del tipo de pago */
export const textoTipoPago = (tipo: string) => (tipo === 'ANTICIPO' ? 'Anticipo (50%)' : 'Pago final');

// ---- Orden de la lista de pedidos ----
export type OrdenPedidos = 'RECIENTES' | 'ANTIGUOS';

export const OPCIONES_ORDEN: { valor: OrdenPedidos; etiqueta: string }[] = [
  { valor: 'RECIENTES', etiqueta: 'Más recientes' },
  { valor: 'ANTIGUOS', etiqueta: 'Más antiguos' },
];

// ---- Previas ----
export type EstadoPrevia = 'APROBADA' | 'RECHAZADA' | 'PENDIENTE';

// Según las columnas aprobada / rechazada de ventas.previas_diseno.
export const estadoPrevia = (previa: PreviaAdmin): EstadoPrevia =>
  previa.aprobada ? 'APROBADA' : previa.rechazada ? 'RECHAZADA' : 'PENDIENTE';

export const COLOR_ESTADO_PREVIA: Record<EstadoPrevia, { bg: string; fg: string; texto: string; icono: IconoAdmin }> = {
  APROBADA: { bg: '#DCFCE7', fg: '#166534', texto: 'Aprobada', icono: 'checkmark-circle' },
  RECHAZADA: { bg: '#FEE2E2', fg: '#991B1B', texto: 'Pidió cambios', icono: 'refresh-circle' },
  PENDIENTE: { bg: '#FEF3C7', fg: '#92400E', texto: 'Esperando respuesta', icono: 'time' },
};

// ---- Archivos ----
export const TIENDA_FISICA = 'TIENDA_FISICA';

export const esPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

// $1,234.50 (sin depender de Intl, que varía entre dispositivos)
export const formatMoney = (n: number): string =>
  '$' + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const formatFecha = (valor?: string | null, conHora = false): string => {
  if (!valor) return '—';
  const f = new Date(valor);
  if (isNaN(f.getTime())) return '—';
  const base = `${String(f.getDate()).padStart(2, '0')} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
  if (!conHora) return base;
  return `${base}, ${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`;
};
