import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { reglasPassword } from '@/features/autenticacion/utils/validaciones';

export type Aviso = { texto: string; ok: boolean };
type Campos = { actual: string; nueva: string; confirmar: string };
const VACIO: Campos = { actual: '', nueva: '', confirmar: '' };

/**
 * Lógica de "Cambiar contraseña" compartida por el perfil del cliente y del admin.
 * - Mismas reglas que el registro (mín. 8, una letra y un número) y distinta a la actual.
 * - Al cambiarla, el backend invalida las sesiones abiertas y aquí se cierra la sesión
 *   para que el usuario entre otra vez con su nueva contraseña.
 */
export const useCambioContrasena = (
  guardarEnServidor: (actual: string, nueva: string) => Promise<{ message?: string }>
) => {
  const { deleteSession } = useAuth();
  const router = useRouter();
  const [pw, setPw] = useState<Campos>(VACIO);
  const [ver, setVer] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const reglas = [
    ...reglasPassword(pw.nueva),
    { texto: 'Diferente a tu contraseña actual', ok: !!pw.nueva && pw.nueva !== pw.actual },
  ];

  const errores = {
    actual: intentado && !pw.actual ? 'Escribe tu contraseña actual' : null,
    confirmar: pw.confirmar && pw.confirmar !== pw.nueva ? 'Las contraseñas no coinciden' : null,
  };

  const valido = !!pw.actual && reglas.every((r) => r.ok) && pw.confirmar === pw.nueva;

  const setCampo = (campo: keyof Campos, valor: string) => {
    setPw((p) => ({ ...p, [campo]: valor.replace(/\s/g, '') }));
    if (aviso && !aviso.ok) setAviso(null);
  };

  const guardar = async () => {
    setIntentado(true);
    if (!valido) {
      setAviso({ texto: 'Revisa los requisitos de la nueva contraseña.', ok: false });
      return;
    }
    setGuardando(true);
    try {
      await guardarEnServidor(pw.actual, pw.nueva);
      setPw(VACIO);
      setAviso({ texto: 'Contraseña actualizada. Por seguridad, inicia sesión con tu nueva contraseña.', ok: true });
      timer.current = setTimeout(() => {
        void deleteSession().then(() => router.replace('/(auth)/login' as any));
      }, 2000);
    } catch (e: any) {
      setAviso({ texto: e?.response?.data?.message ?? 'No se pudo cambiar la contraseña.', ok: false });
    } finally {
      setGuardando(false);
    }
  };

  return {
    pw,
    setCampo,
    ver,
    alternarVer: () => setVer((v) => !v),
    reglas,
    errores,
    valido,
    guardando,
    aviso,
    guardar: () => void guardar(),
  };
};
