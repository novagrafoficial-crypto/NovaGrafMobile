import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { notificacionesAdminService } from '../services/notificacionesAdminService';
import type { NotificacionAdmin } from '../models/NotificacionAdmin';

// Igual que la web (AdminLayout.jsx): se consulta cada 30 s. Además, al volver a primer plano.
const INTERVALO_MS = 30000;

interface NotificacionesContextValue {
  notificaciones: NotificacionAdmin[];
  noLeidas: number;
  cargando: boolean;
  error: string | null;
  /** silencioso = true no muestra el spinner de pantalla completa. */
  refrescar: (silencioso?: boolean) => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodas: () => Promise<void>;
}

const NotificacionesContext = createContext<NotificacionesContextValue | undefined>(undefined);

// Una sola copia de las notificaciones para TODO el panel admin (pestaña, badge y lista).
export const NotificacionesAdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const usuarioId = user?.id_usuario;

  const [notificaciones, setNotificaciones] = useState<NotificacionAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refrescar = useCallback(
    async (silencioso = true) => {
      if (!usuarioId) return;
      if (!silencioso) setCargando(true);
      try {
        setNotificaciones(await notificacionesAdminService.getNoLeidas(usuarioId));
        setError(null);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? e?.message ?? 'No se pudieron cargar las notificaciones.');
      } finally {
        setCargando(false);
      }
    },
    [usuarioId]
  );

  useEffect(() => {
    void refrescar(false);
    const timer = setInterval(() => refrescar(true), INTERVALO_MS);
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void refrescar(true);
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refrescar]);

  // Como el backend solo devuelve las no leídas, al marcar una se quita de la lista al instante.
  // Si el servidor falla, se vuelve a pedir la lista real.
  const marcarLeida = useCallback(
    async (id: number) => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      try {
        await notificacionesAdminService.marcarLeida(id);
      } catch {
        void refrescar(true);
      }
    },
    [refrescar]
  );

  const marcarTodas = useCallback(async () => {
    const ids = notificaciones.map((n) => n.id);
    if (ids.length === 0) return;
    setNotificaciones([]);
    try {
      await notificacionesAdminService.marcarTodas(ids);
    } catch {
      void refrescar(true);
    }
  }, [notificaciones, refrescar]);

  const noLeidas = notificaciones.length;

  const value = useMemo(
    () => ({ notificaciones, noLeidas, cargando, error, refrescar, marcarLeida, marcarTodas }),
    [notificaciones, noLeidas, cargando, error, refrescar, marcarLeida, marcarTodas]
  );

  return <NotificacionesContext.Provider value={value}>{children}</NotificacionesContext.Provider>;
};

export const useNotificacionesAdmin = () => {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error('useNotificacionesAdmin debe usarse dentro de NotificacionesAdminProvider');
  return ctx;
};