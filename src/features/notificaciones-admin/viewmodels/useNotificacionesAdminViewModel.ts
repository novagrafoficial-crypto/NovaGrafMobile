import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useNotificacionesAdmin } from '../providers/NotificacionesAdminProvider';
import type { NotificacionAdmin } from '../models/NotificacionAdmin';

export const useNotificacionesAdminViewModel = () => {
  const router = useRouter();
  const { notificaciones, noLeidas, cargando, error, refrescar, marcarLeida, marcarTodas } = useNotificacionesAdmin();
  const [refrescando, setRefrescando] = useState(false);

  // Al entrar a la pestaña se actualiza sin spinner.
  useFocusEffect(
    useCallback(() => {
      refrescar(true);
    }, [refrescar])
  );

  const onRefresh = async () => {
    setRefrescando(true);
    await refrescar(true);
    setRefrescando(false);
  };

  // Igual que la web: marca como leída y abre el pedido. Si el aviso es de un mensaje,
  // se manda ?chat=1 para que el detalle baje directo al chat.
  // (El campo "enlace" es de la web; en el móvil se navega con pedido_id.)
  const abrir = (n: NotificacionAdmin) => {
    marcarLeida(n.id);
    if (!n.pedido_id) return;
    const esChat = /chat|mensaje/i.test(n.tipo);
    router.push(`/(admin)/pedido/${n.pedido_id}${esChat ? '?chat=1' : ''}` as any);
  };

  return {
    notificaciones,
    noLeidas,
    cargando,
    error,
    refrescando,
    onRefresh,
    reintentar: () => refrescar(false),
    abrir,
    marcarTodas,
  };
};