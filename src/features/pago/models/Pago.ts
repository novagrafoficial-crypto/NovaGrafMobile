export type ModoPago = 'TRANSFERENCIA' | 'DEPOSITO' | 'TIENDA';

export interface DatoBancario { etiqueta: string; valor: string }

export interface DetallePedido {
  producto_nombre: string;
  color: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PagoRegistrado {
  id: number;
  tipo_pago: string;
  monto: number;
  comprobante_url: string | null;
  estado_pago: string;
  notas_admin: string | null;
}

export interface PedidoPago {
  id: number;
  estado: string;
  total_general: number;
  monto_anticipo: number;
  monto_restante: number;
  costo_envio: number;
  direccion_envio: string | null;
  metodo_entrega_nombre: string;
  metodo_pago_id: number | null;
  detalles: DetallePedido[];
  pagos: PagoRegistrado[];
}

export interface MetodoPagoDetalle {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  instrucciones: string | null;
  requiere_comprobante: boolean;
  datos: DatoBancario[];
}

export interface PantallaPago { pedido: PedidoPago; metodo: MetodoPagoDetalle | null }

export interface ArchivoComprobante {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}