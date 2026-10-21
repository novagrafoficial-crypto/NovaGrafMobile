import type { PreviaAdmin } from '../models/PedidoAdmin';

// Estados del pedido (mismos que la web: AdminPedidos.jsx).
export const ESTADOS_PEDIDO = [
  'PENDIENTE_VERIFICACION',
  'EN_DISENO',
  'EN_REVISION',
  'PREVIAS_ENVIADAS',
  'EN_PRODUCCION',
  'PENDIENTE_PAGO_FINAL',
  'ENVIADO',
  'CANCELADO',
] as const;

// Etiquetas en español (con acentos y ñ) para cada estado.
const ETIQUETAS: Record<string, string> = {
  PENDIENTE_VERIFICACION: 'Pendiente de verificación',
  EN_DISENO: 'En diseño',
  EN_REVISION: 'En revisión',
  PREVIAS_ENVIADAS: 'Previas enviadas',
  EN_PRODUCCION: 'En producción',
  PENDIENTE_PAGO_FINAL: 'Pendiente de pago final',
  ENVIADO: 'Enviado',
  CANCELADO: 'Cancelado',
};

// Colores por estado (misma paleta de la web).
const COLORES: Record<string, { bg: string; fg: string }> = {
  PENDIENTE_VERIFICACION: { bg: '#FFF3CD', fg: '#7d5a00' },
  EN_DISENO: { bg: '#d0eaff', fg: '#0a4a7c' },
  EN_REVISION: { bg: '#ffe8d0', fg: '#7a3500' },
  PREVIAS_ENVIADAS: { bg: '#e8d5ff', fg: '#4a0080' },
  EN_PRODUCCION: { bg: '#d4f5eb', fg: '#0F6E56' },
  PENDIENTE_PAGO_FINAL: { bg: '#ffd6d6', fg: '#8b0000' },
  ENVIADO: { bg: '#e0f5e0', fg: '#1a6163' },
  CANCELADO: { bg: '#f0f0f0', fg: '#555555' },
};

export const colorEstado = (estado: string) => COLORES[estado] ?? { bg: '#f0f0f0', fg: '#333333' };

export const etiquetaEstado = (estado: string) =>
  ETIQUETAS[estado] ?? estado.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export const colorEstadoPago = (estado: string) => {
  if (estado === 'APROBADO') return { bg: '#d4f5eb', fg: '#0F6E56' };
  if (estado === 'RECHAZADO') return { bg: '#ffd6d6', fg: '#8b0000' };
  return { bg: '#FFF3CD', fg: '#7d5a00' };
};

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

export const COLOR_ESTADO_PREVIA: Record<EstadoPrevia, { bg: string; fg: string; texto: string }> = {
  APROBADA: { bg: '#d4f5eb', fg: '#0F6E56', texto: '✓ Aprobada' },
  RECHAZADA: { bg: '#ffd6d6', fg: '#8b0000', texto: '✗ Rechazada' },
  PENDIENTE: { bg: '#FFF3CD', fg: '#7d5a00', texto: 'Pendiente de respuesta' },
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
