import type { Pedido } from '../src/features/pedidos/models/Pedido';

/** Crea un pedido de prueba; solo cambias lo que te interesa en cada caso. */
export const crearPedido = (cambios: Partial<Pedido> = {}): Pedido => ({
  id: 15,
  fecha_pedido: '2026-10-20T10:00:00Z',
  estado: 'PENDIENTE_VERIFICACION',
  total_productos: 300,
  costo_envio: 0,
  total_general: 300,
  monto_anticipo: 150,
  monto_restante: 150,
  direccion_envio: null,
  fecha_entrega_estimada: null,
  metodo_entrega_nombre: 'Recoger en tienda',
  metodo_pago_nombre: 'Transferencia',
  detalles: [
    { variante_id: 1, producto_nombre: 'Taza personalizada', color: null, imagen_url: null, cantidad: 2, precio_unitario: 100, subtotal: 200 },
    { variante_id: 2, producto_nombre: 'Gorra', color: 'Negro', imagen_url: null, cantidad: 1, precio_unitario: 100, subtotal: 100 },
  ],
  pagos: [],
  disenos: [],
  previas: [],
  ...cambios,
});

export const crearPago = (id: number, tipo_pago: string, estado_pago: string) => ({
  id, tipo_pago, estado_pago, monto: 150, comprobante_url: null, notas_admin: null, fecha_pago: null,
});
