import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioItem } from '../models/PortfolioItem';

// Todos los trabajos realizados (pantalla "Trabajos realizados" del menú).
export const useTrabajosPublicosViewModel = () => {
  const router = useRouter();
  const [trabajos, setTrabajos] = useState<PortfolioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState('');
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

  const categorias = useMemo(
    () => Array.from(new Set(trabajos.map((t) => t.categoriaNombre).filter(Boolean) as string[])).sort(),
    [trabajos]
  );
  const filtrados = useMemo(
    () => (categoria ? trabajos.filter((t) => t.categoriaNombre === categoria) : trabajos),
    [trabajos, categoria]
  );

  const ir = (ruta: string) => {
    setSeleccionado(null);
    router.push(ruta as any);
  };

  return {
    cargando,
    refrescando,
    error,
    categorias,
    categoria,
    setCategoria,
    filtrados,
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
    abrir: setSeleccionado,
    cerrar: () => setSeleccionado(null),
    entrar: () => ir('/(auth)/login'),
    registrarse: () => ir('/(auth)/register'),
  };
};
