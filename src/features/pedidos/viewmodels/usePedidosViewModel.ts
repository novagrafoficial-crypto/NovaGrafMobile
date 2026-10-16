import { useCallback, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { pedidoService } from '../services/pedidoService';
import type { Pedido } from '../models/Pedido';

export const usePedidosViewModel = () => {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const yaCargo = useRef(false);

  const cargar = useCallback(async () => {
    if (!yaCargo.current) setCargando(true);
    setError(null);
    try {
      setPedidos(await pedidoService.getAll());
      yaCargo.current = true;
    } catch (e) {
      console.error('Error al cargar pedidos:', e);
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Se recarga cada vez que vuelves a la pestaña (p. ej. después de subir un comprobante)
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  return {
    pedidos, cargando, error, refrescando, refrescar, reintentar: cargar,
    verDetalle: (id: number) => router.push(`/(cliente)/pedido/${id}` as any),
    irAPagar: (id: number) => router.push(`/(cliente)/pago-pedido/${id}` as any),
    irAlCatalogo: () => router.push('/(cliente)/productos-base' as any),
  };
};