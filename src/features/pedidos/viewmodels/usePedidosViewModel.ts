import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { pedidoService } from '../services/pedidoService';
import { FILTROS, coincideFiltro, type FiltroPedido } from '../utils/filtrosPedidos';
import type { Pedido } from '../models/Pedido';

export const usePedidosViewModel = () => {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroPedido>('TODOS');
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

  // Más recientes primero
  const ordenados = useMemo(
    () => [...pedidos].sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()),
    [pedidos]
  );

  // Pestañas con su contador; "Cancelados" solo aparece si hay alguno
  const filtros = useMemo(
    () =>
      FILTROS.map((f) => ({ ...f, total: ordenados.filter((p) => coincideFiltro(p, f.key)).length })).filter(
        (f) => f.key !== 'CANCELADOS' || f.total > 0
      ),
    [ordenados]
  );

  const pedidosFiltrados = useMemo(() => ordenados.filter((p) => coincideFiltro(p, filtro)), [ordenados, filtro]);

  const textoVacio: Record<FiltroPedido, string> = {
    TODOS: 'Cuando hagas tu primera compra aparecerá aquí.',
    ACCION: 'Todo al día: no tienes nada pendiente.',
    PROCESO: 'No tienes pedidos en proceso.',
    ENVIADOS: 'Aún no tienes pedidos enviados.',
    CANCELADOS: 'No tienes pedidos cancelados.',
  };

  return {
    pedidos, cargando, error, refrescando, refrescar, reintentar: cargar,
    // Filtros
    filtros, filtro, elegirFiltro: setFiltro,
    pedidosFiltrados,
    sinPedidos: pedidos.length === 0,
    textoVacio: textoVacio[filtro],
    // Navegación
    verDetalle: (id: number) => router.push(`/(cliente)/pedido/${id}` as any),
    irAPagar: (id: number) => router.push(`/(cliente)/pago-pedido/${id}` as any),
    irAlCatalogo: () => router.push('/(cliente)/productos-base' as any),
  };
};