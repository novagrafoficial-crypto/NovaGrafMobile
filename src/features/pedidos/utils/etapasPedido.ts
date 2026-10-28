import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { Pedido } from '../models/Pedido';

/** Nombre de un ícono de Ionicons (https://icons.expo.fyi). */
export type IconoNombre = ComponentProps<typeof Ionicons>['name'];

// ─────────────────────────────────────────────────────────────
// Etapas del flujo de un pedido personalizado (mismo orden que la web):
// Pedido → Anticipo 50% → Tu diseño → Previas → Producción → Pago final 50% → Entrega
// ─────────────────────────────────────────────────────────────

export type EtapaId = 'pedido' | 'anticipo' | 'diseno' | 'previas' | 'produccion' | 'pagoFinal' | 'entrega';

/** completada = ya pasó · actual = aquí está el pedido · pendiente = todavía no llega */
export type EstadoEtapa = 'completada' | 'actual' | 'pendiente';

export interface Etapa {
  id: EtapaId;
  numero: number;
  titulo: string;
  icono: IconoNombre;
  estado: EstadoEtapa;
  /** Texto corto bajo el título: qué está pasando en esa etapa. */
  resumen: string;
}

const ETAPAS_BASE: { id: EtapaId; titulo: string; icono: IconoNombre }[] = [
  { id: 'pedido', titulo: 'Pedido realizado', icono: 'receipt-outline' },
  { id: 'anticipo', titulo: 'Anticipo (50%)', icono: 'card-outline' },
  { id: 'diseno', titulo: 'Tu diseño', icono: 'color-palette-outline' },
  { id: 'previas', titulo: 'Previas de diseño', icono: 'eye-outline' },
  { id: 'produccion', titulo: 'Producción', icono: 'construct-outline' },
  { id: 'pagoFinal', titulo: 'Pago final (50%)', icono: 'cash-outline' },
  { id: 'entrega', titulo: 'Entrega', icono: 'cube-outline' },
];

// Estado del pedido (enum del backend) → índice de la etapa ACTUAL.
// ENVIADO = 7 → todas completadas.
const INDICE_POR_ESTADO: Record<string, number> = {
  PENDIENTE_VERIFICACION: 1,
  EN_DISENO: 2,
  EN_REVISION: 3,
  PREVIAS_ENVIADAS: 3,
  EN_PRODUCCION: 4,
  PENDIENTE_PAGO_FINAL: 5,
  VERIFICANDO_PAGO_FINAL: 5,
  ENVIADO: 7,
};

export const esCancelado = (p: Pedido) => p.estado.includes('CANCEL');

export const indiceEtapaActual = (p: Pedido) => INDICE_POR_ESTADO[p.estado] ?? 0;

export const pagoAnticipo = (p: Pedido) => p.pagos.find((x) => x.tipo_pago === 'ANTICIPO') ?? null;
// El más reciente: si el admin rechazó uno, el cliente pudo subir otro
export const pagoFinal = (p: Pedido) => [...p.pagos].reverse().find((x) => x.tipo_pago !== 'ANTICIPO') ?? null;

const resumenDe = (id: EtapaId, estado: EstadoEtapa, p: Pedido): string => {
  if (estado === 'pendiente') return 'Aún no inicia';
  const anticipo = pagoAnticipo(p);
  const final = pagoFinal(p);
  const previasPendientes = p.previas.filter((x) => !x.aprobada && !x.rechazada).length;

  switch (id) {
    case 'pedido':
      return `${p.detalles.reduce((s, d) => s + d.cantidad, 0)} piezas · ${p.metodo_entrega_nombre}`;
    case 'anticipo':
      if (estado === 'completada') return 'Anticipo verificado';
      if (anticipo?.estado_pago === 'RECHAZADO') return 'Comprobante rechazado, súbelo de nuevo';
      return anticipo ? 'Verificando tu comprobante' : 'Paga el anticipo para iniciar';
    case 'diseno':
      if (estado === 'completada') return `${p.disenos.length} archivo(s) enviados`;
      return p.disenos.length ? 'Diseños recibidos' : 'Sube tus archivos de diseño';
    case 'previas':
      if (estado === 'completada') return 'Previa aprobada';
      if (p.estado === 'PREVIAS_ENVIADAS' && previasPendientes) return 'Tienes una previa por revisar';
      return 'Nuestro equipo está preparando tu previa';
    case 'produccion':
      return estado === 'completada' ? 'Producción terminada' : 'Estamos fabricando tu pedido';
    case 'pagoFinal':
      if (estado === 'completada') return 'Pago final verificado';
      if (p.estado === 'VERIFICANDO_PAGO_FINAL') return 'Verificando tu pago final';
      if (final?.estado_pago === 'RECHAZADO') return 'Comprobante rechazado, envíalo de nuevo';
      return 'Liquida el saldo restante';
    case 'entrega':
      return estado === 'completada' ? 'Pedido enviado' : 'Preparando tu entrega';
  }
};

export const construirEtapas = (p: Pedido): Etapa[] => {
  const actual = indiceEtapaActual(p);
  const cancelado = esCancelado(p);
  return ETAPAS_BASE.map((e, i) => {
    // Si se canceló, solo marcamos como completado lo que ya pasó (al menos el pedido).
    const estado: EstadoEtapa = cancelado
      ? i === 0 ? 'completada' : 'pendiente'
      : i < actual ? 'completada' : i === actual ? 'actual' : 'pendiente';
    return { ...e, numero: i + 1, estado, resumen: resumenDe(e.id, estado, p) };
  });
};

/** Progreso 0..1 para la barra de la tarjeta y del encabezado. */
export const progresoPedido = (p: Pedido) => {
  if (esCancelado(p)) return 0;
  return Math.min(indiceEtapaActual(p), ETAPAS_BASE.length) / ETAPAS_BASE.length;
};

export const TOTAL_ETAPAS = ETAPAS_BASE.length;