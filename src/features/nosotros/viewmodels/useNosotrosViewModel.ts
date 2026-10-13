import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { nosotrosService } from '../services/nosotrosService';
import { formatMesAnio } from '../utils/formatFecha';
import type { AntecedenteConFecha, NosotrosData } from '../models/Nosotros';

const VACIO: NosotrosData = { mision: null, vision: null, valores: [], antecedentes: [] };

export const useNosotrosViewModel = () => {
  const router = useRouter();
  const [data, setData] = useState<NosotrosData>(VACIO);
  const [loading, setLoading] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresco = false) => {
    try {
      if (esRefresco) setRefrescando(true);
      else setLoading(true);
      setError(null);
      setData(await nosotrosService.getNosotros());
    } catch {
      setError('No se pudo cargar la información. Revisa tu conexión.');
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const lineaTiempo = useMemo<AntecedenteConFecha[]>(
    () => data.antecedentes.map((a) => ({ ...a, fechaTexto: formatMesAnio(a.fecha_evento) })),
    [data.antecedentes]
  );

  return {
    mision: data.mision,
    vision: data.vision,
    valores: data.valores,
    lineaTiempo,
    loading,
    refrescando,
    error,
    reintentar: () => cargar(),
    refrescar: () => cargar(true),
    // Es una pantalla pública: si no hay a dónde regresar, va al inicio
    regresar: () => (router.canGoBack() ? router.back() : router.replace('/' as any)),
  };
};