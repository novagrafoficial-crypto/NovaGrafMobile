import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { pedidoService } from '../services/pedidoService';
import { necesitaPago, tieneAnticipo } from '../utils/pedidoUtils';
import type { Pedido, PreviaPedido } from '../models/Pedido';

export const COMENTARIO_MIN = 5;
export const COMENTARIO_MAX = 500

const mensajeDeError = (e: any, porDefecto: string) =>
  e?.response?.data?.message ?? porDefecto;

export const usePedidoDetalleViewModel = (pedidoId: number) => {
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revisión de previas
  const [previaARechazar, setPreviaARechazar] = useState<PreviaPedido | null>(null);
  const [enviandoRevision, setEnviandoRevision] = useState(false);
  const [errorRevision, setErrorRevision] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setPedido(await pedidoService.getById(pedidoId));
    } catch (e) {
      console.error('Error al cargar pedido:', e);
      setError('No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const previas = pedido?.previas ?? [];
  const hayAprobada = previas.some((p) => p.aprobada);
  // Solo se puede revisar la previa pendiente más reciente y mientras el pedido espera respuesta.
  const previaPendiente =
    pedido?.estado === 'PREVIAS_ENVIADAS' && !hayAprobada
      ? [...previas].reverse().find((p) => !p.aprobada && !p.rechazada) ?? null
      : null;

  const aprobarPrevia = (previa: PreviaPedido) => {
    Alert.alert(
      'Aprobar previa',
      `¿Confirmas que la previa ${previa.numero_previa} es la correcta? Tu pedido pasará a producción y ya no se podrá cambiar el diseño.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, aprobar',
          onPress: async () => {
            setEnviandoRevision(true);
            try {
              await pedidoService.aprobarPrevia(pedidoId, previa.numero_previa);
              await cargar();
            } catch (e) {
              Alert.alert('No se pudo aprobar', mensajeDeError(e, 'Intenta de nuevo en unos minutos.'));
              await cargar();
            } finally {
              setEnviandoRevision(false);
            }
          },
        },
      ]
    );
  };

  const abrirRechazo = (previa: PreviaPedido) => {
    setErrorRevision(null);
    setPreviaARechazar(previa);
  };

  const cerrarRechazo = () => {
    if (enviandoRevision) return;
    setPreviaARechazar(null);
    setErrorRevision(null);
  };

  const confirmarRechazo = async (comentario: string) => {
    if (!previaARechazar) return;
    const texto = comentario.trim();
    if (texto.length < COMENTARIO_MIN) {
      setErrorRevision(`Cuéntanos qué cambiar (mínimo ${COMENTARIO_MIN} caracteres).`);
      return;
    }
    setEnviandoRevision(true);
    setErrorRevision(null);
    try {
      await pedidoService.rechazarPrevia(pedidoId, previaARechazar.numero_previa, texto);
      setPreviaARechazar(null);
      await cargar();
    } catch (e) {
      setErrorRevision(mensajeDeError(e, 'No se pudo enviar tu respuesta. Intenta de nuevo.'));
    } finally {
      setEnviandoRevision(false);
    }
  };

   return {
    pedido, cargando, error, reintentar: cargar,
    debePagar: pedido ? necesitaPago(pedido) : false,
    tienePago: pedido ? tieneAnticipo(pedido) : false,
    disenos: pedido?.disenos ?? [],
    previas,
    previaPendiente,
    // Revisión de previas
    previaARechazar, enviandoRevision, errorRevision,
    aprobarPrevia, abrirRechazo, cerrarRechazo, confirmarRechazo,
    // Si ya envió sus diseños no se vuelve a ofrecer el botón de subir
    debeSubirDiseno: pedido?.estado === 'EN_DISENO' && (pedido?.disenos.length ?? 0) === 0,
    irADiseno: () => router.push(`/(cliente)/diseno-pedido/${pedidoId}` as any),
    irAPagar: () => router.push(`/(cliente)/pago-pedido/${pedidoId}` as any),
    abrirUrl: (url: string) => Linking.openURL(url),
    volver: () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/pedidos' as any)),
  };
};