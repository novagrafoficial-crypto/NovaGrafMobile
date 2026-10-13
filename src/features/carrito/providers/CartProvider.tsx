import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { cartService } from '../services/cartService';
import type { CartItem } from '../models/CartItem';

interface CartContextValue {
  items: CartItem[];
  total: number;
  /** Total de piezas (suma de cantidades): es el número de la pestaña. */
  count: number;
  loading: boolean;
  error: string | null;
  /** silent = true no muestra el spinner de pantalla completa. */
  refreshCart: (silent?: boolean) => Promise<void>;
  addToCart: (varianteId: string | number, cantidad: number) => Promise<void>;
  updateQuantity: (detalleId: number, cantidad: number) => Promise<void>;
  removeItem: (detalleId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Equivale al CartContext de la web: una sola copia del carrito para toda la app.
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const esCliente = user?.rol === 'cliente';
  const userId = user?.id_usuario;

  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(
    async (silent = false) => {
      if (!esCliente) {
        setItems([]);
        setTotal(0);
        return;
      }
      try {
        if (!silent) setLoading(true);
        setError(null);
        const cart = await cartService.getCart();
        setItems(cart.items);
        setTotal(cart.total);
      } catch (e) {
        console.error('Error al cargar el carrito:', e);
        setError('No se pudo cargar el carrito.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [esCliente]
  );

  // Carga al iniciar sesión y limpia al cerrarla
  useEffect(() => {
    refreshCart();
  }, [refreshCart, userId]);

  const addToCart = useCallback(
    async (varianteId: string | number, cantidad: number) => {
      await cartService.addToCart(varianteId, cantidad);
      await refreshCart(true);
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (detalleId: number, cantidad: number) => {
      await cartService.updateQuantity(detalleId, cantidad);
      await refreshCart(true);
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (detalleId: number) => {
      await cartService.removeItem(detalleId);
      await refreshCart(true);
    },
    [refreshCart]
  );

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    await refreshCart(true);
  }, [refreshCart]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      total,
      count: items.reduce((suma, i) => suma + i.cantidad, 0),
      loading,
      error,
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, total, loading, error, refreshCart, addToCart, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
};