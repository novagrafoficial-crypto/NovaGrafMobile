import type { DatoBancario, MetodoPagoDetalle, ModoPago, PantallaPago } from '../models/Pago';
import { folioDe, money } from '@/shared/utils/format';

// datos_bancarios puede venir como objeto, texto JSON o arreglo (igual que en la web)
export const normalizarDatos = (data: unknown): DatoBancario[] => {
  let v: any = data;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return []; } }
  if (Array.isArray(v)) {
    v = v[0];
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return []; } }
  }
  if (!v || typeof v !== 'object') return [];
  const especiales: Record<string, string> = { clabe: 'CLABE', rfc: 'RFC' };
  return Object.entries(v).map(([clave, valor]) => ({
    etiqueta: especiales[clave.toLowerCase()] ??
      clave.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    valor: String(valor),
  }));
};

export const aBooleano = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return !['false', 'no', 'n', '0'].includes(val.trim().toLowerCase());
  return true;
};

// La web decide "tienda" por requiere_comprobante; el tipo distingue transferencia de depósito.
export const modoDePago = (m: MetodoPagoDetalle | null): ModoPago => {
  if (!m) return 'TRANSFERENCIA';
  if (!m.requiere_comprobante) return 'TIENDA';
  return m.tipo === 'DEPOSITO' ? 'DEPOSITO' : 'TRANSFERENCIA';
};

export { folioDe, money };

// Texto para el botón "Compartir / guardar" (sirve como "descargar" sin librerías extra)
export const textoParaCompartir = ({ pedido, metodo }: PantallaPago, cliente: string): string => {
  const modo = modoDePago(metodo);
  const lineas = [
    `Nova Graf · Pedido ${folioDe(pedido.id)}`,
    `Cliente: ${cliente}`,
    `Entrega: ${pedido.metodo_entrega_nombre}`,
    '',
    modo === 'TIENDA' ? 'PAGO EN TIENDA' : modo === 'DEPOSITO' ? 'DEPÓSITO BANCARIO' : 'TRANSFERENCIA',
    `Anticipo (50%): ${money(pedido.monto_anticipo)} MXN`,
    ...(metodo?.datos ?? []).map((d) => `${d.etiqueta}: ${d.valor}`),
    ...(modo !== 'TIENDA' ? [`Referencia / concepto: ${folioDe(pedido.id)}`] : []),
    '',
    'Productos:',
    ...pedido.detalles.map((d) => `• ${d.producto_nombre} x${d.cantidad} — ${money(d.subtotal)}`),
    '',
    `Total: ${money(pedido.total_general)} · Saldo restante: ${money(pedido.monto_restante)}`,
  ];
  return lineas.join('\n');
};