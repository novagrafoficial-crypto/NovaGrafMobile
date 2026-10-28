import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { portfolioService } from '@/features/portafolio/services/portfolioService';
import type { PortfolioItem } from '@/features/portafolio';

// En el inicio solo unos cuantos trabajos; "Ver más" lleva a la pantalla con todos.
const MAX_TRABAJOS = 6;

export const usePublicHomeViewModel = () => {
  const router = useRouter();
  const [trabajos, setTrabajos] = useState<PortfolioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<PortfolioItem | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setTrabajos(await portfolioService.getPublic());
    } catch {
      setError('No pudimos cargar los trabajos. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const ir = (ruta: string) => {
    setSeleccionado(null);
    router.push(ruta as any);
  };

  return {
    cargando,
    refrescando,
    error,
    trabajos: trabajos.slice(0, MAX_TRABAJOS),
    hayMas: trabajos.length > MAX_TRABAJOS,
    total: trabajos.length,
    refrescar: async () => {
      setRefrescando(true);
      await cargar();
      setRefrescando(false);
    },
    reintentar: () => {
      setCargando(true);
      cargar();
    },
    seleccionado,
    abrirTrabajo: setSeleccionado,
    cerrarTrabajo: () => setSeleccionado(null),
    verTrabajos: () => router.navigate('/(public)/trabajos' as any),
    // El botón del banner lleva a "Mi cuenta" (iniciar sesión o registrarse)
    irACuenta: () => router.navigate('/(public)/cuenta' as any),
    entrar: () => ir('/(auth)/login'),
    registrarse: () => ir('/(auth)/register'),
  };
};
