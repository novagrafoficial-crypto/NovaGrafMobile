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
});

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const data = await cartApi.getCart();
    const items: CartItem[] = Array.isArray(data?.items) ? data.items.map(aCartItem) : [];
    const total = Number(data?.total ?? items.reduce((suma, i) => suma + i.subtotal, 0));
    return { items, total };
  },

  addToCart: (varianteId: string | number, cantidad: number) =>
    cartApi.addToCart(varianteId, cantidad),

  updateQuantity: (detalleId: number, cantidad: number) =>
    cartApi.updateQuantity(detalleId, cantidad),

  removeItem: (detalleId: number) => cartApi.removeItem(detalleId),

  clearCart: () => cartApi.clearCart(),
};