import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/shared/hooks/useAuth';
import { notificacionesService } from '../services/notificacionesService';
import type { Notificacion } from '../models/Notificacion';

const INTERVALO_MS = 30000; 

interface NotificacionesContextValue {
  notificaciones: Notificacion[];
  noLeidas: number;
  cargando: boolean;
  refrescar: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  eliminar: (id: number) => Promise<void>;
}

const NotificacionesContext = createContext<NotificacionesContextValue | undefined>(undefined);


export const NotificacionesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const esCliente = user?.rol === 'cliente';
  const userId = user?.id_usuario;

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);

  const refrescar = useCallback(async () => {
    if (!esCliente) {
      setNotificaciones([]);
      setNoLeidas(0);
      return;
    }
    try {
      const res = await notificacionesService.getAll();
      setNotificaciones(res.notificaciones);
      setNoLeidas(res.noLeidas);
    } catch (e) {
      // Silencioso: es polling; si falla una vez, el siguiente ciclo lo reintenta.
      console.error('Error al cargar notificaciones:', e);
    }
  }, [esCliente]);

  // Carga al iniciar sesión, limpia al cerrarla y repite cada 30 s (solo con la app abierta).
  useEffect(() => {
    if (!esCliente) {
      setNotificaciones([]);
      setNoLeidas(0);
      return;
    }
    setCargando(true);
    void refrescar().finally(() => setCargando(false));

    const intervalo = setInterval(() => {
      if (AppState.currentState === 'active') void refrescar();
    }, INTERVALO_MS);
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void refrescar(); 
    });

    return () => {
      clearInterval(intervalo);
      sub.remove();
    };
  }, [esCliente, userId, refrescar]);

  const marcarLeida = useCallback(async (id: number) => {
    const objetivo = notificaciones.find((n) => n.id === id);
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    if (objetivo && !objetivo.leida) setNoLeidas((c) => Math.max(0, c - 1));
    try {
      await notificacionesService.marcarLeida(id);
    } catch (e) {
      console.error('Error al marcar como leída:', e);
      void refrescar(); 
    }
  }, [notificaciones, refrescar]);

  const marcarTodasLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
    try {
      await notificacionesService.marcarTodasLeidas();
    } catch (e) {
      console.error('Error al marcar todas como leídas:', e);
      void refrescar();
    }
  }, [refrescar]);

  const eliminar = useCallback(async (id: number) => {
    const objetivo = notificaciones.find((n) => n.id === id);
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    if (objetivo && !objetivo.leida) setNoLeidas((c) => Math.max(0, c - 1));
    try {
      await notificacionesService.eliminar(id);
    } catch (e) {
      console.error('Error al eliminar notificación:', e);
      void refrescar();
    }
  }, [notificaciones, refrescar]);

  const value = useMemo<NotificacionesContextValue>(
    () => ({ notificaciones, noLeidas, cargando, refrescar, marcarLeida, marcarTodasLeidas, eliminar }),
    [notificaciones, noLeidas, cargando, refrescar, marcarLeida, marcarTodasLeidas, eliminar]
  );

  return <NotificacionesContext.Provider value={value}>{children}</NotificacionesContext.Provider>;
};

export const useNotificaciones = () => {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de <NotificacionesProvider>');
  return ctx;
};