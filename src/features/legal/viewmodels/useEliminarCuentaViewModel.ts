import { useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { legalService } from '../services/legalService';

// Usuario @ dominio(s) separados por punto: sin partes que se traslapen (evita backtracking)
const CORREO = /^[^\s@]+@(?:[^\s@.]+\.)+[^\s@.]{2,}$/;

export const useEliminarCuentaViewModel = () => {
  const router = useRouter();
  const { user } = useAuth();
  // Si tiene sesión, el correo ya viene puesto y no se puede cambiar
  const correoSesion = user?.correo_electronico ?? '';

  const [correo, setCorreo] = useState<string>(correoSesion);
  const [motivo, setMotivo] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  // Plan B: si el servidor no responde, se puede mandar por correo
  const [correoEmpresa, setCorreoEmpresa] = useState<string | null>(null);

  const enviar = async () => {
    const c = correo.trim().toLowerCase();
    if (!CORREO.test(c)) {
      setErrorCorreo('Escribe el correo con el que te registraste');
      return;
    }
    if (!confirmado) {
      setError('Marca la casilla para confirmar que quieres eliminar tu cuenta.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      setEnviado(await legalService.solicitarEliminacion(c, motivo.trim()));
    } catch {
      setError('No pudimos enviar la solicitud en este momento.');
      setCorreoEmpresa(await legalService.correoEmpresa());
    } finally {
      setEnviando(false);
    }
  };

  const enviarPorCorreo = () => {
    if (!correoEmpresa) return;
    const asunto = encodeURIComponent('Solicitud de eliminación de cuenta');
    const cuerpo = encodeURIComponent(
      `Hola, solicito eliminar mi cuenta de Nova Graf.\n\nCorreo de la cuenta: ${correo.trim()}\nMotivo: ${motivo.trim() || 'No especificado'}`
    );
    Linking.openURL(`mailto:${correoEmpresa}?subject=${asunto}&body=${cuerpo}`).catch(() => {});
  };

  return {
    conSesion: !!correoSesion,
    correo,
    setCorreo: (v: string) => {
      setCorreo(v.replace(/\s/g, ''));
      setErrorCorreo(null);
    },
    motivo,
    setMotivo: (v: string) => setMotivo(v.slice(0, 500)),
    confirmado,
    alternarConfirmado: () => {
      setConfirmado((v) => !v);
      setError(null);
    },
    errorCorreo,
    error,
    enviando,
    enviado,
    correoEmpresa,
    enviar,
    enviarPorCorreo,
    volver: () => (router.canGoBack() ? router.back() : router.replace('/' as any)),
  };
};
