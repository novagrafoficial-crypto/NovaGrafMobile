import { brandColors, brandTints } from '@/constants/brand';
import type { Pedido } from '../models/Pedido';

export const TIENDA_FISICA = 'TIENDA_FISICA';

export const tieneAnticipo = (p: Pedido) => p.pagos.some((x) => x.tipo_pago === 'ANTICIPO');

// Mismo criterio que la pantalla de pago
export const necesitaPago = (p: Pedido) => p.estado === 'PENDIENTE_VERIFICACION' && !tieneAnticipo(p);

export const esPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

// Etiqueta legible + colores. Ajusta las palabras clave a los estados reales de tu enum.
export const estadoInfo = (estado: string) => {
  const label = estado.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  if (estado.includes('CANCEL')) return { label, bg: brandTints.errorSoft, fg: brandColors.error };
  if (estado.includes('PENDIENTE')) return { label, bg: brandTints.surfaceMuted, fg: brandTints.textMuted };
  return { label, bg: brandTints.accentSoft, fg: brandColors.primary };
};