import { cartApi } from '@/data/api/cartApi';
import type { Cart, CartItem } from '../models/CartItem';

// Convierte lo que manda el backend a un CartItem con tipos correctos.
const aCartItem = (r: any): CartItem => ({
  detalle_id: Number(r.detalle_id),
  variante_id: Number(r.variante_id),
  producto_id: Number(r.producto_id),
  producto_nombre: r.producto_nombre,
  color: r.color ?? null,
  imagen_url: r.imagen_url ?? null,
  cantidad: Number(r.cantidad),
  precio_unitario: Number(r.precio_unitario),
  subtotal: Number(r.subtotal),
  // Si el backend todavía no manda descuentos, se usa el precio normal
  precio_original: Number(r.precio_original ?? r.precio_unitario),
  descuento_nombre: r.descuento_nombre ?? null,
  ahorro: Number(r.ahorro ?? 0),
  descuento_pendiente: r.descuento_pendiente
    ? {
        nombre: r.descuento_pendiente.nombre,
        cantidad_minima: Number(r.descuento_pendiente.cantidad_minima),
        faltan: Number(r.descuento_pendiente.faltan),
      }
    : null,
});

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const data = await cartApi.getCart();
    const items: CartItem[] = Array.isArray(data?.items) ? data.items.map(aCartItem) : [];
    const total = Number(data?.total ?? items.reduce((suma, i) => suma + i.subtotal, 0));
    const ahorro = items.reduce((suma, i) => suma + i.ahorro, 0);
    return { items, total, ahorro };
  },

  addToCart: (varianteId: string | number, cantidad: number) =>
    cartApi.addToCart(varianteId, cantidad),

  updateQuantity: (detalleId: number, cantidad: number) =>
    cartApi.updateQuantity(detalleId, cantidad),

  removeItem: (detalleId: number) => cartApi.removeItem(detalleId),

  clearCart: () => cartApi.clearCart(),
};