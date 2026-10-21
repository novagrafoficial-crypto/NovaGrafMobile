import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { pedidosAdminService } from '../services/pedidosAdminService';
import type { PedidoResumen } from '../models/PedidoAdmin';
import { ESTADOS_PEDIDO, OPCIONES_ORDEN, etiquetaEstado, type OrdenPedidos } from '../utils/pedidoAdminUtils';

export type FiltroEstado = 'TODOS' | string;

const normalizar = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const tiempo = (fecha: string) => {
  const t = new Date(fecha).getTime();
  return isNaN(t) ? 0 : t;
};

export const usePedidosAdminViewModel = () => {
  const router = useRouter();
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

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  // Opciones del combo de estado: "Todos" + cada estado, con su cantidad de pedidos.
  const opcionesEstado = useMemo(() => {
    const conteo: Record<string, number> = {};
    pedidos.forEach((p) => {
      conteo[p.estado] = (conteo[p.estado] ?? 0) + 1;
    });
    return [
      { valor: 'TODOS', etiqueta: 'Todos', detalle: String(pedidos.length) },
      ...ESTADOS_PEDIDO.map((e) => ({ valor: e as string, etiqueta: etiquetaEstado(e), detalle: String(conteo[e] ?? 0) })),
    ];
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    const q = normalizar(busqueda).replace(/^#/, '');
    const filtrados = pedidos.filter((p) => {
      const coincideEstado = filtro === 'TODOS' || p.estado === filtro;
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
    opcionesOrden: OPCIONES_ORDEN as { valor: string; etiqueta: string }[],
    refrescar,
    reintentar: cargar,
    abrirPedido: (id: number) => router.push(`/(admin)/pedido/${id}` as any),
  };
};
