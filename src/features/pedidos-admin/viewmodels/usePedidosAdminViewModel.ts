import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { pedidosAdminService } from '../services/pedidosAdminService';
import type { PedidoResumen } from '../models/PedidoAdmin';
import { ESTADOS_PEDIDO, OPCIONES_ORDEN, accionAdmin, etiquetaEstado, type OrdenPedidos } from '../utils/pedidoAdminUtils';

// 'TODOS', 'ATENDER' (los que esperan una acción del admin) o un estado del pedido
export type FiltroEstado = 'TODOS' | 'ATENDER' | string;

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const tiempo = (fecha: string) => {
  const t = new Date(fecha).getTime();
  return isNaN(t) ? 0 : t;
};

export const usePedidosAdminViewModel = () => {
  const router = useRouter();
  // Desde el Inicio se puede llegar con ?estado=EN_PRODUCCION
  const { estado: estadoParam } = useLocalSearchParams<{ estado?: string }>();
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('TODOS');
  const [orden, setOrden] = useState<OrdenPedidos>('RECIENTES');

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setPedidos(await pedidosAdminService.getPedidos());
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Se recarga cada vez que el admin vuelve a esta pestaña.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Si viene un estado desde el Inicio, se aplica ese filtro
  useFocusEffect(
    useCallback(() => {
      if (estadoParam) {
        setFiltro(estadoParam);
        router.setParams({ estado: undefined } as any);
      }
    }, [estadoParam, router])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  // Chips de filtro: Todos, Por atender y cada estado (solo los que tienen pedidos), con su cantidad.
  const opcionesEstado = useMemo(() => {
    const conteo: Record<string, number> = {};
    pedidos.forEach((p) => {
      conteo[p.estado] = (conteo[p.estado] ?? 0) + 1;
    });
    const porAtender = pedidos.filter((p) => !!accionAdmin(p.estado)).length;
    return [
      { valor: 'TODOS', etiqueta: 'Todos', cantidad: pedidos.length },
      { valor: 'ATENDER', etiqueta: 'Por atender', cantidad: porAtender },
      ...ESTADOS_PEDIDO.filter((e) => (conteo[e] ?? 0) > 0 || e === filtro).map((e) => ({
        valor: e as string,
        etiqueta: etiquetaEstado(e),
        cantidad: conteo[e] ?? 0,
      })),
    ];
  }, [pedidos, filtro]);

  const pedidosFiltrados = useMemo(() => {
    const q = normalizar(busqueda).replace(/^#/, '');
    const filtrados = pedidos.filter((p) => {
      const coincideEstado =
        filtro === 'TODOS' || (filtro === 'ATENDER' ? !!accionAdmin(p.estado) : p.estado === filtro);
      const coincideTexto =
        !q || normalizar(`${p.id} ${p.cliente_nombre} ${p.cliente_correo}`).includes(q);
      return coincideEstado && coincideTexto;
    });

    // Se ordena una copia (filter ya la creó). Si hay empate de fecha, manda el id.
    const signo = orden === 'RECIENTES' ? -1 : 1;
    return filtrados.sort((a, b) => signo * (tiempo(a.fecha_pedido) - tiempo(b.fecha_pedido) || a.id - b.id));
  }, [pedidos, busqueda, filtro, orden]);

  return {
    pedidos,
    pedidosFiltrados,
    cargando,
    refrescando,
    error,
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    opcionesEstado,
    orden,
    setOrden: (o: string) => setOrden(o as OrdenPedidos),
    alternarOrden: () => setOrden((o) => (o === 'RECIENTES' ? 'ANTIGUOS' : 'RECIENTES')),
    limpiarFiltros: () => {
      setBusqueda('');
      setFiltro('TODOS');
    },
    opcionesOrden: OPCIONES_ORDEN as { valor: string; etiqueta: string }[],
    refrescar,
    reintentar: cargar,
    abrirPedido: (id: number) => router.push(`/(admin)/pedido/${id}` as any),
  };
};
