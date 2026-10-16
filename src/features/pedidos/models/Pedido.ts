export interface PedidoItem {
  producto_nombre: string;
  color: string | null;
  imagen_url: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PagoDelPedido {
  id: number;
  tipo_pago: string;
  monto: number;
  comprobante_url: string | null;
  estado_pago: string;
  notas_admin: string | null;
  fecha_pago: string | null;
}

export interface Pedido {
  id: number;
  fecha_pedido: string;
  estado: string;
  total_productos: number;
  costo_envio: number;
  total_general: number;
  monto_anticipo: number;
  monto_restante: number;
  direccion_envio: string | null;
  fecha_entrega_estimada: string | null;
  metodo_entrega_nombre: string;
  metodo_pago_nombre: string | null;
  detalles: PedidoItem[];
  pagos: PagoDelPedido[];
}