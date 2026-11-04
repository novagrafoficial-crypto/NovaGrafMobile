import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { legalService, type Politica } from '../services/legalService';

export const usePoliticasViewModel = () => {
  const router = useRouter();
  const [politicas, setPoliticas] = useState<Politica[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setPoliticas(await legalService.getPoliticas());
    } catch {
      // Si falla, se muestra igual el aviso de privacidad (es texto fijo)
      setPoliticas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  return {
    politicas,
    cargando,
    volver: () => (router.canGoBack() ? router.back() : router.replace('/' as any)),
    irAEliminar: () => router.push('/eliminar-cuenta' as any),
  };
};
