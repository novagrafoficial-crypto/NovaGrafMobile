import { adminPedidosApi } from '@/data/api/adminPedidosApi';
import { subirImagenPrevia } from '@/data/supabasePrevias';
import type { ArchivoPrevia, PedidoCompleto, PedidoResumen } from '../models/PedidoAdmin';

// pg devuelve los numeric como string: se convierten aquí, una sola vez.
const num = (v: any): number => Number(v ?? 0);

const aResumen = (r: any): PedidoResumen => ({
  id: Number(r.id),
  fecha_pedido: r.fecha_pedido ?? '',
  estado: r.estado ?? '',
  total_general: num(r.total_general),
  monto_anticipo: num(r.monto_anticipo),
  monto_restante: num(r.monto_restante),
  direccion_envio: r.direccion_envio ?? null,
  cliente_nombre: r.cliente_nombre ?? '',
  cliente_correo: r.cliente_correo ?? '',
  metodo_entrega: r.metodo_entrega ?? null,
  metodo_pago: r.metodo_pago ?? null,
});

const lista = (r: any): any[] => (Array.isArray(r) ? r : []);

// Misma convención de ruta que la web: previas/<timestamp>-<aleatorio>.<ext>
const subirImagen = (archivo: ArchivoPrevia): Promise<string> => {
  const ext = (archivo.name.split('.').pop() || 'jpg').toLowerCase();
  const ruta = `previas/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return subirImagenPrevia(ruta, { uri: archivo.uri, mimeType: archivo.mimeType });
};

export const pedidosAdminService = {
  getPedidos: async (): Promise<PedidoResumen[]> => lista(await adminPedidosApi.getAll()).map(aResumen),

  getPedido: async (id: number): Promise<PedidoCompleto> => {
    const r = await adminPedidosApi.getById(id);
    if (!r?.pedido) throw new Error('Pedido no encontrado');

    return {
      pedido: aResumen(r.pedido),
      productos: lista(r.detalle).map((d) => {
        const cantidad = num(d.cantidad);
        const precio = num(d.precio_unitario);
        return {
          producto_nombre: d.producto_nombre ?? '',
          sku: d.sku ?? '',
          cantidad,
          precio_unitario: precio,
          subtotal: d.subtotal != null ? num(d.subtotal) : cantidad * precio,
          color: d.color ?? null,
          imagen_url: d.imagen_url ?? d.imagen_variante ?? null,
          descripcion: d.descripcion ?? d.producto_descripcion ?? null,
        };
      }),
      pagos: lista(r.pagos).map((p) => ({
        id: Number(p.id),
        tipo_pago: p.tipo_pago ?? '',
        monto: num(p.monto),
        estado_pago: p.estado_pago ?? 'PENDIENTE',
        comprobante_url: p.comprobante_url ?? null,
        notas_admin: p.notas_admin ?? null,
        fecha_pago: p.fecha_pago ?? null,
      })),
      previas: lista(r.previas)
        .map((p) => ({
          id: Number(p.id),
          numero_previa: num(p.numero_previa),
          imagen_url: p.imagen_url ?? '',
          aprobada: Boolean(p.aprobada),
          rechazada: Boolean(p.rechazada),
          fecha_subida: p.fecha_subida ?? null,
          fecha_vista: p.fecha_vista ?? null,
          fecha_aprobacion: p.fecha_aprobacion ?? null,
        }))
        // Siempre de la primera a la última, sin depender del orden del backend.
        .sort((a, b) => a.numero_previa - b.numero_previa),
      disenos: lista(r.disenos).map((d) => ({
        id: Number(d.id),
        tipo_origen: d.tipo_origen ?? '',
        notas_cliente: d.notas_cliente ?? null,
        archivo_url: d.archivo_url ?? null,
        fecha_envio: d.fecha_envio ?? null,
        usaSimulador: Boolean(d.simulador_json),
      })),
    };
  },

  // PATCH /admin/pedidos/:id/estado (igual que la web)
  cambiarEstado: (id: number, estado: string) => adminPedidosApi.actualizarEstado(id, estado),

  // PATCH /admin/pedidos/pagos/:id (igual que la web)
  resolverPago: (pagoId: number, estado_pago: 'APROBADO' | 'RECHAZADO', notas: string) =>
    adminPedidosApi.actualizarPago(pagoId, estado_pago, notas),

  // Se envía UNA previa a la vez. Si el cliente la rechaza, el admin sube otra
  // (numero_previa + 1) hasta que el cliente apruebe. Al enviarla el pedido pasa a PREVIAS_ENVIADAS.
  enviarPrevia: async (pedidoId: number, archivo: ArchivoPrevia, numeroPrevia: number) => {
    const url = await subirImagen(archivo);
    await adminPedidosApi.subirPrevia({ pedido_cliente_id: pedidoId, numero_previa: numeroPrevia, imagen_url: url });
    await adminPedidosApi.actualizarEstado(pedidoId, 'PREVIAS_ENVIADAS');
  },
};
