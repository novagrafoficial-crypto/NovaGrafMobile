import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { pedidoService } from '../services/pedidoService';
import { necesitaPago, tieneAnticipo } from '../utils/pedidoUtils';
import type { Pedido } from '../models/Pedido';

export const usePedidoDetalleViewModel = (pedidoId: number) => {
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setPedido(await pedidoService.getById(pedidoId));
    } catch (e) {
      console.error('Error al cargar pedido:', e);
      setError('No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  return {
    pedido, cargando, error, reintentar: cargar,
    debePagar: pedido ? necesitaPago(pedido) : false,
    tienePago: pedido ? tieneAnticipo(pedido) : false,
    irAPagar: () => router.push(`/(cliente)/pago-pedido/${pedidoId}` as any),
    abrirUrl: (url: string) => Linking.openURL(url),
    volver: () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/pedidos' as any)),
  };
};