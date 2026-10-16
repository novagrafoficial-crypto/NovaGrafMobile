import { pagoApi } from '@/data/api/pagoApi';
import { checkoutApi } from '@/data/api/checkoutApi';
import { subirArchivo   } from '@/data/supabase';
import { aBooleano, normalizarDatos } from '../utils/pagoUtils';
import type { ArchivoComprobante, MetodoPagoDetalle, PantallaPago, PedidoPago } from '../models/Pago';

const aPedido = (r: any): PedidoPago => ({
  id: Number(r.id),
  estado: r.estado,
  total_general: Number(r.total_general),
  monto_anticipo: Number(r.monto_anticipo),
  monto_restante: Number(r.monto_restante),
  costo_envio: Number(r.costo_envio),
  direccion_envio: r.direccion_envio ?? null,
  metodo_entrega_nombre: r.metodo_entrega_nombre ?? '',
  metodo_pago_id: r.metodo_pago_id ? Number(r.metodo_pago_id) : null,
  detalles: (r.detalles ?? []).map((d: any) => ({
    producto_nombre: d.producto_nombre,
    color: d.color ?? null,
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
  })),
});

const aMetodo = (r: any): MetodoPagoDetalle => ({
  id: Number(r.id),
  nombre: r.nombre,
  tipo: r.tipo,
  descripcion: r.descripcion ?? null,
  instrucciones: r.instrucciones ?? null,
  requiere_comprobante: aBooleano(r.requiere_comprobante),
  datos: normalizarDatos(r.datos_bancarios),
});

// Misma convención de nombre de archivo que la web
const subirComprobante = async (
  archivo: ArchivoComprobante, pedidoId: number, usuarioId: number, nombreCliente: string
): Promise<string> => {
  const limpio =
    nombreCliente.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'cliente';
  const ext = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  const fecha = new Date().toISOString().split('T')[0];
  const ruta = `comprobantes/usuario_${usuarioId}/ANTICIPO_Pedido_${pedidoId}_Cliente_${limpio}_${fecha}_${Date.now()}.${ext}`;

  return subirArchivo(ruta, { uri: archivo.uri, mimeType: archivo.mimeType });
};

export const pagoService = {
  getPantalla: async (pedidoId: number): Promise<PantallaPago> => {
    const pedido = aPedido(await pagoApi.getPedido(pedidoId));
    const metodos = await checkoutApi.metodosPago();
    const crudo = (Array.isArray(metodos) ? metodos : []).find(
      (m: any) => Number(m.id) === pedido.metodo_pago_id
    );
    return { pedido, metodo: crudo ? aMetodo(crudo) : null };
  },

  // archivo = null → pago en tienda (el backend lo guarda como 'TIENDA_FISICA')
  registrarAnticipo: async (datos: {
    pedido: PedidoPago; archivo: ArchivoComprobante | null; nota: string;
    usuarioId: number; nombreCliente: string;
  }) => {
    const { pedido, archivo, nota, usuarioId, nombreCliente } = datos;
    const url = archivo ? await subirComprobante(archivo, pedido.id, usuarioId, nombreCliente) : null;
    return pagoApi.registrarComprobante(pedido.id, {
      tipo_pago: 'ANTICIPO',
      monto: pedido.monto_anticipo,
      comprobante_url: url ?? 'TIENDA_FISICA',
      notas_admin: nota.trim() || null,
    });
  },
};