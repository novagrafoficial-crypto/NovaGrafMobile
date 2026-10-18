import { checkoutApi } from '@/data/api/checkoutApi';
import type { CheckoutOptions, MetodoPago, NuevoPedido, OpcionEntrega } from '../models/Checkout';

// PostgreSQL manda los decimales como texto: aquí se convierten a número.
const aOpcion = (r: any): OpcionEntrega => ({
  id: Number(r.id),
  tipo: r.tipo,
  nombre: r.nombre,
  descripcion: r.descripcion ?? null,
  costo: Number(r.costo) || 0,
});

const aMetodoPago = (r: any): MetodoPago => ({
  id: Number(r.id),
  nombre: r.nombre,
  tipo: r.tipo,
  descripcion: r.descripcion ?? null,
  requiere_comprobante: !!r.requiere_comprobante,
});

const lista = (d: any) => (Array.isArray(d) ? d : []);

export const checkoutService = {
  getOptions: async (): Promise<CheckoutOptions> => {
    const [t, p, c, m] = await Promise.all([
      checkoutApi.tiendas(),
      checkoutApi.puntosMedios(),
      checkoutApi.colonias(),
      checkoutApi.metodosPago(),
    ]);
    return {
      tiendas: lista(t).map(aOpcion),
      puntosMedios: lista(p).map(aOpcion),
      colonias: lista(c).map(aOpcion),
      metodosPago: lista(m).map(aMetodoPago),
    };
  },

  // Solo mandamos IDs: el backend recalcula precios, envío y 50/50 desde la BD.
  crearPedido: async (datos: NuevoPedido): Promise<number> => {
    const res = await checkoutApi.crearPedido({ ...datos, distancia_km: 0 });
    return Number(res.pedido_id ?? res.pedidoId);
  },
};