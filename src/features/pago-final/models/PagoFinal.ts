import type {
  ArchivoComprobante, MetodoPagoDetalle, ModoPago, PagoRegistrado, PedidoPago,
} from '@/features/pago/models/Pago';

// Reutilizamos los modelos del anticipo: el pedido y el método de pago son los mismos.
export type { ArchivoComprobante, MetodoPagoDetalle, ModoPago, PagoRegistrado, PedidoPago };

export interface PantallaPagoFinal {
  pedido: PedidoPago;
  metodo: MetodoPagoDetalle | null;
  /** Suma de pagos ya APROBADOS por el admin. */
  pagado: number;
  /** total_general - pagado (lo mismo que valida el backend en calcularMontoPendiente). */
  montoPendiente: number;
  /** Último pago final registrado (SALDO_FINAL), si existe. */
  pagoFinal: PagoRegistrado | null;
}