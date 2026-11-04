import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useNotificaciones } from '../providers/NotificacionesProvider';
import type { Notificacion } from '../models/Notificacion';

export type FiltroNotif = 'TODAS' | 'NO_LEIDAS';

export interface SeccionNotif {
  title: string;
  data: Notificacion[];
}

// Agrupa por fecha: Hoy · Esta semana · Anteriores (como WhatsApp o Mercado Libre)
const agrupar = (lista: Notificacion[]): SeccionNotif[] => {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const hace7 = inicioHoy.getTime() - 6 * 24 * 60 * 60 * 1000;

  const hoy: Notificacion[] = [];
  const semana: Notificacion[] = [];
  const antes: Notificacion[] = [];
  for (const n of lista) {
    const t = new Date(n.creado_en).getTime();
    if (t >= inicioHoy.getTime()) hoy.push(n);
    else if (t >= hace7) semana.push(n);
    else antes.push(n);
  }
  return [
    { title: 'Hoy', data: hoy },
    { title: 'Esta semana', data: semana },
    { title: 'Anteriores', data: antes },
  ].filter((s) => s.data.length > 0);
};

export const useNotificacionesViewModel = () => {
  const router = useRouter();
  const { notificaciones, noLeidas, cargando, refrescar, marcarLeida, marcarTodasLeidas, eliminar } =
    useNotificaciones();
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroNotif>('TODAS');

  const secciones = useMemo(() => {
    const lista = filtro === 'NO_LEIDAS' ? notificaciones.filter((n) => !n.leida) : notificaciones;
    return agrupar(lista);
  }, [notificaciones, filtro]);

  const abrir = (n: Notificacion) => {
    if (!n.leida) void marcarLeida(n.id);
    if (n.pedido_id) router.push(`/(cliente)/pedido/${n.pedido_id}` as any);
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await refrescar();
    setRefrescando(false);
  };

  return {
    secciones,
    total: notificaciones.length,
    noLeidas,
    cargando: cargando && notificaciones.length === 0,
    refrescando,
    onRefresh,
    filtro,
    elegirFiltro: setFiltro,
    abrir,
    eliminar,
    marcarTodasLeidas,
    volver: () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/inicio' as any)),
  };
};