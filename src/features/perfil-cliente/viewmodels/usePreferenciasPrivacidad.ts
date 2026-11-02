import { useEffect, useState } from 'react';
import type { PreferenciasPrivacidad } from '../models/ClientProfile';
import { clientProfileService } from '../services/clientProfileService';

export const PRIVACIDAD_DEFAULT: PreferenciasPrivacidad = { recibe_avisos: true };
export const MSG_PRIVACIDAD_CARGA = 'No se pudieron cargar tus preferencias de privacidad.';
export const MSG_PRIVACIDAD_GUARDAR = 'No se pudo guardar el cambio. Inténtalo de nuevo.';

type Clave = keyof PreferenciasPrivacidad;

/**
 * Derecho ARCO de Oposición (Opt-Out).
 * Carga la preferencia del backend y guarda el switch al momento;
 * si el servidor falla, el switch regresa a su valor anterior.
 */
export const usePreferenciasPrivacidad = (userId?: number) => {
  const [prefs, setPrefs] = useState<PreferenciasPrivacidad>(PRIVACIDAD_DEFAULT);
  const [cargando, setCargando] = useState<boolean>(!!userId);
  const [guardando, setGuardando] = useState<Clave | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let activo = true;
    const cargar = async () => {
      try {
        const data = await clientProfileService.getPrivacidad(userId);
        if (activo) {
          setPrefs({ recibe_avisos: data?.recibe_avisos !== false });
        }
      } catch {
        if (activo) setError(MSG_PRIVACIDAD_CARGA);
      } finally {
        if (activo) setCargando(false);
      }
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, [userId]);

  const cambiar = async (clave: Clave, valor: boolean) => {
    if (!userId || guardando) return;
    const anterior = prefs;
    setPrefs({ ...prefs, [clave]: valor });
    setGuardando(clave);
    setError(null);
    try {
      await clientProfileService.updatePrivacidad(userId, { [clave]: valor });
    } catch {
      setPrefs(anterior);
      setError(MSG_PRIVACIDAD_GUARDAR);
    } finally {
      setGuardando(null);
    }
  };

  return { prefs, cargando, guardando, error, cambiar };
};
