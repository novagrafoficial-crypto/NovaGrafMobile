import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { chatPedidoService } from '../services/chatPedidoService';
import type { MensajeChat } from '../models/MensajeChat';

// Sin websockets: mientras la pantalla está enfocada se consulta cada 8 s.
const INTERVALO_MS = 8000;

const mensajeError = (e: any) =>
  e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Ocurrió un error.';

export const useChatPedidoViewModel = (pedidoId: number) => {
  const { user } = useAuth();
  const adminId = user?.id_usuario ?? 0;

  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const enviandoRef = useRef(false);

  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    try {
      const lista = await chatPedidoService.getMensajes(pedidoId);
      // Si no hay mensajes nuevos se conserva el mismo arreglo (sin re-render ni salto de scroll).
      setMensajes((prev) =>
        prev.length === lista.length && prev[prev.length - 1]?.id === lista[lista.length - 1]?.id ? prev : lista
      );
      setError(null);
    } catch (e: any) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const timer = setInterval(cargar, INTERVALO_MS);
      return () => clearInterval(timer);
    }, [cargar])
  );

  const enviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje || enviandoRef.current) return;
    if (!adminId) {
      setError('No se pudo identificar tu sesión. Vuelve a iniciar sesión.');
      return;
    }
    enviandoRef.current = true;
    setEnviando(true);
    try {
      await chatPedidoService.enviar(pedidoId, adminId, mensaje);
      setTexto('');
      await cargar();
    } catch (e: any) {
      setError(mensajeError(e)); // el texto se conserva para reintentar
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return {
    mensajes,
    cargando,
    enviando,
    texto,
    setTexto,
    enviar,
    error,
    esMio: (m: MensajeChat) => m.remitente_id === adminId,
  };
};