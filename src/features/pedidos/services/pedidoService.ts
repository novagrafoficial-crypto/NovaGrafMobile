import { pedidosApi } from '@/data/api/pedidosApi';
import type { Pedido } from '../models/Pedido';

// json_agg devuelve null si no hay filas; PostgreSQL manda los decimales como texto.
const aPedido = (r: any): Pedido => ({
  id: Number(r.id),
  fecha_pedido: r.fecha_pedido,
  estado: r.estado,
  total_productos: Number(r.total_productos),
  costo_envio: Number(r.costo_envio),
  total_general: Number(r.total_general),
  monto_anticipo: Number(r.monto_anticipo),
  monto_restante: Number(r.monto_restante),
  direccion_envio: r.direccion_envio ?? null,
  fecha_entrega_estimada: r.fecha_entrega_estimada ?? null,
  metodo_entrega_nombre: r.metodo_entrega_nombre ?? '',
  metodo_pago_nombre: r.metodo_pago_nombre ?? null,
  detalles: (r.detalles ?? []).map((d: any) => ({
    producto_nombre: d.producto_nombre,
    color: d.color ?? null,
    imagen_url: d.imagen_url ?? null,
    cantidad: Number(d.cantidad),
    precio_unitario: Number(d.precio_unitario),
    subtotal: Number(d.subtotal),
  })),
  pagos: (r.pagos ?? []).map((p: any) => ({
    id: Number(p.id),
    tipo_pago: p.tipo_pago,
    monto: Number(p.monto),
    comprobante_url: p.comprobante_url ?? null,
    estado_pago: p.estado_pago,
    notas_admin: p.notas_admin ?? null,
    fecha_pago: p.fecha_pago ?? null,
  })),
});

export const pedidoService = {
  getAll: async (): Promise<Pedido[]> => {
    const data = await pedidosApi.getAll();
    return (Array.isArray(data) ? data : []).map(aPedido);
  },
  getById: async (id: number): Promise<Pedido> => aPedido(await pedidosApi.getById(id)),
};