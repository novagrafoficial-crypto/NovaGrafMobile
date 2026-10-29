import type { Pedido } from '../models/Pedido';
import { esCancelado, pagoAnticipo, pagoFinal } from './etapasPedido';

// Pestañas de filtro de "Mis pedidos" (como "Compras" en Mercado Libre o Amazon)
export type FiltroPedido = 'TODOS' | 'ACCION' | 'PROCESO' | 'ENVIADOS' | 'CANCELADOS';

export const FILTROS: { key: FiltroPedido; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ACCION', label: 'Pendientes' },
  { key: 'PROCESO', label: 'En proceso' },
  { key: 'ENVIADOS', label: 'Enviados' },
  { key: 'CANCELADOS', label: 'Cancelados' },
];

/** true si el pedido está esperando algo del CLIENTE (pagar, subir diseño, revisar previa…). */
export const requiereAccion = (p: Pedido): boolean => {
  switch (p.estado) {
    case 'PENDIENTE_VERIFICACION': {
      const a = pagoAnticipo(p);
      return !a || a.estado_pago === 'RECHAZADO';
    }
    case 'EN_DISENO':
      return p.disenos.length === 0;
    case 'PREVIAS_ENVIADAS':
      return p.previas.some((x) => !x.aprobada && !x.rechazada);
    case 'PENDIENTE_PAGO_FINAL':
      return pagoFinal(p)?.estado_pago !== 'PENDIENTE';
    default:
      return false;
  }
};

const esEnviado = (p: Pedido) => p.estado === 'ENVIADO';

export const coincideFiltro = (p: Pedido, f: FiltroPedido): boolean => {
  switch (f) {
    case 'TODOS':
      return true;
    case 'ACCION':
      return !esCancelado(p) && requiereAccion(p);
    case 'PROCESO':
      return !esCancelado(p) && !esEnviado(p) && !requiereAccion(p);
    case 'ENVIADOS':
      return esEnviado(p);
    case 'CANCELADOS':
      return esCancelado(p);
  }
};