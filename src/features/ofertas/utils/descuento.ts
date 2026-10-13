import type { Oferta } from '../models/Oferta';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// '2026-10-31T00:00:00.000Z' -> '31 de octubre' (se lee del texto para que la zona horaria no mueva el día)
export const fechaCorta = (fecha?: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha ?? '');
  if (!m) return '';
  const mes = MESES[Number(m[2]) - 1];
  return mes ? `${Number(m[3])} de ${mes}` : '';
};

const numero = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// Igual que getDescuentoTexto de la web: "20% OFF" o "$50.00 OFF"
export const textoDescuento = (tipo: string, valor: number): string => {
  if (tipo === 'porcentaje') return `${numero(valor)}% OFF`;
  if (tipo === 'fijo') return `$${valor.toFixed(2)} OFF`;
  return '';
};

// La oferta más fuerte (mayor porcentaje; si no hay porcentajes, el mayor monto fijo)
export const mejorOferta = (ofertas: Oferta[]): Oferta | null => {
  if (ofertas.length === 0) return null;
  const porcentajes = ofertas.filter((o) => o.tipo === 'porcentaje');
  const base = porcentajes.length > 0 ? porcentajes : ofertas;
  return base.reduce((a, b) => (b.valor > a.valor ? b : a));
};