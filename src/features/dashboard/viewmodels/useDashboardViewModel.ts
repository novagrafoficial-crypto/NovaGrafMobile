import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { getInitials } from '@/shared/utils/getInitials';
import { pedidosAdminService } from '@/features/pedidos-admin/services/pedidosAdminService';
import { clientesAdminService } from '@/features/clientes-admin/services/clientesAdminService';
import { useNotificacionesAdmin } from '@/features/notificaciones-admin';
import { ESTADOS_PEDIDO, accionAdmin } from '@/features/pedidos-admin/utils/pedidoAdminUtils';
import type { PedidoResumen } from '@/features/pedidos-admin/models/PedidoAdmin';

const CERRADOS = ['ENVIADO', 'CANCELADO'];

const esDeEsteMes = (fecha: string) => {
  const f = new Date(fecha);
  const hoy = new Date();
  return !Number.isNaN(f.getTime()) && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
};

// Inicio del administrador: resumen del negocio calculado con los pedidos y clientes.
export const useDashboardViewModel = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { noLeidas } = useNotificacionesAdmin();

  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [totalClientes, setTotalClientes] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const [lista, clientes] = await Promise.all([
        pedidosAdminService.getPedidos(),
        clientesAdminService.getClientes().catch(() => null), // si falla, solo no se muestra el número
      ]);
      setPedidos(lista);
      setTotalClientes(clientes ? clientes.length : null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo cargar el resumen.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Se actualiza cada vez que el admin vuelve al inicio
  useFocusEffect(useCallback(() => { void cargar(); }, [cargar]));

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const resumen = useMemo(() => {
    const activos = pedidos.filter((p) => !CERRADOS.includes(p.estado));
    const porAtender = pedidos
      .filter((p) => !!accionAdmin(p.estado))
      // Los más viejos primero: son los más urgentes
      .sort((a, b) => new Date(a.fecha_pedido).getTime() - new Date(b.fecha_pedido).getTime());
    const ventasMes = pedidos
      .filter((p) => p.estado !== 'CANCELADO' && esDeEsteMes(p.fecha_pedido))
      .reduce((s, p) => s + p.total_general, 0);

    // Cuántos pedidos hay en cada etapa (sin cancelados)
    const etapas = ESTADOS_PEDIDO.filter((e) => e !== 'CANCELADO').map((estado) => ({
      estado,
      cantidad: pedidos.filter((p) => p.estado === estado).length,
    }));
    const maximo = Math.max(1, ...etapas.map((e) => e.cantidad));

    return { activos: activos.length, porAtender, ventasMes, etapas, maximo };
  }, [pedidos]);

  return {
    nombre: user?.nombre?.split(' ')[0] ?? '',
    iniciales: getInitials(user?.nombre),
    noLeidas,
    cargando,
    refrescando,
    error,
    refrescar,
    reintentar: cargar,
    totalPedidos: pedidos.length,
    totalClientes,
    ...resumen,
    abrirPedido: (id: number) => router.push(`/(admin)/pedido/${id}` as any),
    verPedidos: (estado?: string) =>
      router.push((estado ? `/(admin)/pedidos?estado=${estado}` : '/(admin)/pedidos') as any),
    verClientes: () => router.push('/(admin)/usuarios' as any),
    verAvisos: () => router.push('/(admin)/notificaciones' as any),
  };
};
