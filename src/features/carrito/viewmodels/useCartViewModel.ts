import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '../providers/CartProvider';
import type { CartItem } from '../models/CartItem';

const CANTIDAD_MAXIMA = 99;

type Mensaje = { texto: string; ok: boolean };

export const useCartViewModel = () => {
  const cart = useCart();
  const router = useRouter();

  const [itemAEliminar, setItemAEliminar] = useState<CartItem | null>(null);
  const [vaciarVisible, setVaciarVisible] = useState<boolean>(false);
  const [ocupadoId, setOcupadoId] = useState<number | null>(null);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const avisar = (texto: string, ok = true) => {
    setMensaje({ texto, ok });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMensaje(null), 3000);
  };

  const cambiarCantidad = async (item: CartItem, nueva: number) => {
    if (nueva < 1 || nueva > CANTIDAD_MAXIMA) return;
    setOcupadoId(item.detalle_id);
    try {
      await cart.updateQuantity(item.detalle_id, nueva);
    } catch {
      avisar('No se pudo actualizar la cantidad.', false);
    } finally {
      setOcupadoId(null);
    }
  };

  const confirmarEliminar = async () => {
    if (!itemAEliminar) return;
    const item = itemAEliminar;
    setItemAEliminar(null);
    try {
      await cart.removeItem(item.detalle_id);
      avisar('Producto eliminado del carrito.');
    } catch {
      avisar('No se pudo eliminar el producto.', false);
    }
  };

  const confirmarVaciar = async () => {
    setVaciarVisible(false);
    try {
      await cart.clearCart();
      avisar('Carrito vaciado.');
    } catch {
      avisar('No se pudo vaciar el carrito.', false);
    }
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cart.refreshCart(true);
    setRefrescando(false);
  };

  return {
    items: cart.items,
    total: cart.total,
    count: cart.count,
    loading: cart.loading,
    error: cart.error,
    refrescando,
    refrescar,
    reintentar: () => cart.refreshCart(),
    mensaje,
    ocupadoId,
    cambiarCantidad,
    itemAEliminar,
    pedirEliminar: (item: CartItem) => setItemAEliminar(item),
    cancelarEliminar: () => setItemAEliminar(null),
    confirmarEliminar,
    vaciarVisible,
    pedirVaciar: () => setVaciarVisible(true),
    cancelarVaciar: () => setVaciarVisible(false),
    confirmarVaciar,
    irAlCatalogo: () => router.push('/(cliente)/productos-base' as any),
    // El checkout todavía no existe en el móvil
    irAPagar: () => router.push('/(cliente)/checkout' as any),
  };
};