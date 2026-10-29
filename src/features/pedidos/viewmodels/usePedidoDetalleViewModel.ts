import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { pedidoService } from '../services/pedidoService';
import { necesitaPago, tieneAnticipo } from '../utils/pedidoUtils';
import {
  construirEtapas, esCancelado, pagoAnticipo, pagoFinal, progresoPedido, type EtapaId,
} from '../utils/etapasPedido';
import type { SiguientePaso } from '../components/SiguientePasoCard';
import type { Pedido, PreviaPedido } from '../models/Pedido';

export const COMENTARIO_MIN = 5;
export const COMENTARIO_MAX = 500;

const mensajeDeError = (e: any, porDefecto: string) =>
  e?.response?.data?.message ?? porDefecto;

export const usePedidoDetalleViewModel = (pedidoId: number) => {
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revisión de previas
  const [previaARechazar, setPreviaARechazar] = useState<PreviaPedido | null>(null);
  const [previaAAprobar, setPreviaAAprobar] = useState<PreviaPedido | null>(null);
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

  useFocusEffect(useCallback(() => { void cargar(); }, [cargar]));

  const previas = pedido?.previas ?? [];
  const hayAprobada = previas.some((p) => p.aprobada);
  // Solo se puede revisar la previa pendiente más reciente y mientras el pedido espera respuesta.
  const previaPendiente =
    pedido?.estado === 'PREVIAS_ENVIADAS' && !hayAprobada
      ? [...previas].reverse().find((p) => !p.aprobada && !p.rechazada) ?? null
      : null;

  // ── Flujo paso a paso ──────────────────────────────────────
  const etapas = useMemo(() => (pedido ? construirEtapas(pedido) : []), [pedido]);
  const [etapaAbierta, setEtapaAbierta] = useState<EtapaId | null>(null);

  // Al cargar (o cambiar de estado) se abre sola la etapa en la que va el pedido.
  const idActual = etapas.find((e) => e.estado === 'actual')?.id ?? null;
  useEffect(() => { setEtapaAbierta(idActual); }, [idActual]);

  const toggleEtapa = (id: EtapaId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEtapaAbierta((abierta) => (abierta === id ? null : id));
  };

  const irADiseno = () => router.push(`/(cliente)/diseno-pedido/${pedidoId}` as any);
  const irAPagar = () => router.push(`/(cliente)/pago-pedido/${pedidoId}` as any);
  const irAChat = () => router.push(`/(cliente)/chat-pedido/${pedidoId}` as any);
  const irAPagoFinal = () => router.push(`/(cliente)/pago-final/${pedidoId}` as any);
  // Abre la etapa de previas para que el cliente vea la imagen antes de decidir.
  const verPrevias = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEtapaAbierta('previas');
  };

  const siguientePaso = useMemo<SiguientePaso | null>(() => {
    if (!pedido) return null;
    if (esCancelado(pedido)) {
      return { tono: 'cancelado', titulo: 'Pedido cancelado', texto: 'Si tienes dudas, escríbenos por el chat del pedido.' };
    }
    const anticipo = pagoAnticipo(pedido);
    switch (pedido.estado) {
      case 'PENDIENTE_VERIFICACION':
        if (!anticipo) {
          return { tono: 'accion', titulo: 'Paga tu anticipo', texto: 'Con el 50% del total iniciamos tu diseño.', boton: 'Pagar anticipo', onPress: irAPagar };
        }
        if (anticipo.estado_pago === 'RECHAZADO') {
          return { tono: 'accion', titulo: 'Revisa tu comprobante', texto: anticipo.notas_admin ?? 'Tu comprobante no se pudo validar.', boton: 'Subir de nuevo', onPress: irAPagar };
        }
        return { tono: 'espera', titulo: 'Verificando tu anticipo', texto: 'Estamos revisando tu comprobante. Te avisaremos al confirmarlo.' };
      case 'EN_DISENO':
        return pedido.disenos.length === 0
          ? { tono: 'accion', titulo: 'Sube tu diseño', texto: 'Envíanos el logo, imagen o idea para cada producto.', boton: 'Subir mis diseños', onPress: irADiseno }
          : { tono: 'espera', titulo: 'Diseños recibidos', texto: 'Nuestro equipo ya tiene tus archivos.' };
      case 'EN_REVISION':
        return { tono: 'espera', titulo: 'Preparando tu previa', texto: 'Nuestro diseñador está trabajando en la propuesta de tu producto.' };
      case 'PREVIAS_ENVIADAS':
        return previaPendiente
          ? { tono: 'accion', titulo: `Revisa la previa ${previaPendiente.numero_previa}`, texto: 'Apruébala para pasar a producción o pide los cambios que necesites.', boton: 'Revisar previa', onPress: verPrevias }
          : { tono: 'espera', titulo: 'Preparando una nueva previa', texto: 'Recibimos tus comentarios y estamos aplicando los cambios.' };
      case 'EN_PRODUCCION':
        return { tono: 'espera', titulo: 'En producción', texto: 'Tu pedido se está fabricando. Te avisaremos cuando esté listo.' };
      case 'PENDIENTE_PAGO_FINAL': {
        const final = pagoFinal(pedido);
        if (final?.estado_pago === 'PENDIENTE') {
          return { tono: 'espera', titulo: 'Verificando tu pago final', texto: 'En cuanto lo confirmemos preparamos la entrega.' };
        }
        return final?.estado_pago === 'RECHAZADO'
          ? { tono: 'accion', titulo: 'Reenvía tu pago final', texto: final.notas_admin ?? 'Tu comprobante no se pudo validar.', boton: 'Pagar saldo', onPress: irAPagoFinal }
          : { tono: 'accion', titulo: 'Liquida tu saldo', texto: 'Tu pedido está listo. Paga el saldo restante para enviarlo.', boton: 'Pagar saldo', onPress: irAPagoFinal };
      }
      case 'VERIFICANDO_PAGO_FINAL':
        return { tono: 'espera', titulo: 'Verificando tu pago final', texto: 'En cuanto lo confirmemos preparamos la entrega.' };
      case 'ENVIADO':
        return { tono: 'listo', titulo: '¡Tu pedido va en camino!', texto: 'Gracias por confiar en Nova Graf.' };
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido, previaPendiente]);

  // ── Aprobar previa (con el modal de la app, no el Alert del sistema) ──
  const aprobarPrevia = (previa: PreviaPedido) => {
    setErrorRevision(null);
    setPreviaAAprobar(previa);
  };

  const cerrarAprobacion = () => {
    if (enviandoRevision) return;
    setPreviaAAprobar(null);
    setErrorRevision(null);
  };

  const confirmarAprobacion = async () => {
    if (!previaAAprobar) return;
    setEnviandoRevision(true);
    setErrorRevision(null);
    try {
      await pedidoService.aprobarPrevia(pedidoId, previaAAprobar.numero_previa);
      setPreviaAAprobar(null);
      await cargar();
    } catch (e) {
      setErrorRevision(mensajeDeError(e, 'No se pudo aprobar. Intenta de nuevo en unos minutos.'));
    } finally {
      setEnviandoRevision(false);
    }
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
    previaAAprobar, cerrarAprobacion, confirmarAprobacion,
    // Si ya envió sus diseños no se vuelve a ofrecer el botón de subir
    debeSubirDiseno: pedido?.estado === 'EN_DISENO' && (pedido?.disenos.length ?? 0) === 0,
    irADiseno,
    irAPagar,
    irAChat,
    irAPagoFinal,
    // Puede pagar si el pedido espera el pago final y no hay uno en verificación
    puedePagarFinal:
      pedido?.estado === 'PENDIENTE_PAGO_FINAL' && pagoFinal(pedido)?.estado_pago !== 'PENDIENTE',
    // Flujo paso a paso
    etapas,
    etapaAbierta,
    toggleEtapa,
    siguientePaso,
    progreso: pedido ? progresoPedido(pedido) : 0,
    cancelado: pedido ? esCancelado(pedido) : false,
    pagoAnticipo: pedido ? pagoAnticipo(pedido) : null,
    pagoFinal: pedido ? pagoFinal(pedido) : null,
    abrirUrl: (url: string) => Linking.openURL(url),
    volver: () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/pedidos' as any)),
  };
};