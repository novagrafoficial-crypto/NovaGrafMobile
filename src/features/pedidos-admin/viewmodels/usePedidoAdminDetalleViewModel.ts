import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { pedidosAdminService } from '../services/pedidosAdminService';
import { estadoPrevia, textoTipoPago, type EstadoPrevia, type IconoAdmin } from '../utils/pedidoAdminUtils';
import type {
  ArchivoPrevia,
  DetalleSeleccionado,
  PagoAdmin,
  PedidoCompleto,
  PreviaAdmin,
} from '../models/PedidoAdmin';

export interface AvisoUI {
  texto: string;
  ok: boolean;
}

export interface Confirmacion {
  titulo: string;
  mensaje: string;
  icono?: string;
  textoConfirmar: string;
  tono?: 'peligro' | 'normal';
  onConfirmar: () => void;
}

// Tarjeta "Próximo paso": qué le toca hacer al admin con este pedido.
export interface ProximoPaso {
  tono: 'accion' | 'espera' | 'listo' | 'cancelado';
  icono: IconoAdmin;
  titulo: string;
  texto: string;
  boton?: { texto: string; icono: IconoAdmin; onPress: () => void };
  /** Sección a la que se baja con el botón (en lugar de onPress) */
  destino?: 'pagos' | 'previas';
}

// Mensaje que se muestra arriba de las previas según cómo va la revisión del cliente.
export interface BannerPrevias {
  texto: string;
  tono: 'info' | 'aviso' | 'ok';
}

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// El backend responde { error: '...' }
const mensajeError = (e: any) =>
  e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Ocurrió un error.';

export const usePedidoAdminDetalleViewModel = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pedidoId = Number(id);

  const [data, setData] = useState<PedidoCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState<AvisoUI | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [notasPago, setNotasPago] = useState<Record<number, string>>({});
  const [previa, setPrevia] = useState<ArchivoPrevia | null>(null);
  const [detalle, setDetalle] = useState<DetalleSeleccionado | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const mostrarAviso = (texto: string, ok = true) => {
    setAviso({ texto, ok });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 4000);
  };

  const cargar = useCallback(async () => {
    if (!pedidoId) return;
    try {
      setError(null);
      setData(await pedidosAdminService.getPedido(pedidoId));
    } catch (e: any) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  // Ejecuta una acción, avisa el resultado y recarga el pedido: así se ve el estado
  // que dejó la base de datos (incluidos los cambios que haga el disparador).
  const ejecutar = async (accion: () => Promise<unknown>, mensajeOk: string) => {
    setTrabajando(true);
    try {
      await accion();
      mostrarAviso(mensajeOk);
      await cargar();
    } catch (e: any) {
      mostrarAviso(mensajeError(e), false);
    } finally {
      setTrabajando(false);
    }
  };

  const cerrarConfirmacion = () => setConfirmacion(null);

  // ---- Hoja de detalle (producto, diseño, comprobante o previa) ----
  const abrirDetalle = (d: DetalleSeleccionado) => setDetalle(d);
  const cerrarDetalle = () => setDetalle(null);

  // ---- Pagos ----
  const editarNotaPago = (pagoId: number, texto: string) =>
    setNotasPago((n) => ({ ...n, [pagoId]: texto }));

  const pedirResolverPago = (pago: PagoAdmin, estado: 'APROBADO' | 'RECHAZADO') => {
    const aprobar = estado === 'APROBADO';
    const notaEscrita = (notasPago[pago.id] ?? '').trim();
    // Al rechazar, el motivo es obligatorio: es lo que el cliente ve para corregir su pago.
    if (!aprobar && !notaEscrita) {
      mostrarAviso('Escribe el motivo del rechazo para que el cliente sepa qué corregir.', false);
      return;
    }
    // Al aprobar sin escribir nada, se conserva la nota que ya tenía el pago.
    const nota = notaEscrita || pago.notas_admin || '';
    const tipo = textoTipoPago(pago.tipo_pago).toLowerCase();
    setConfirmacion({
      titulo: aprobar ? 'Aprobar pago' : 'Rechazar pago',
      mensaje: aprobar
        ? `¿Confirmas que el comprobante del ${tipo} es válido?`
        : `El cliente verá tu motivo y podrá subir otro comprobante del ${tipo}.`,
      icono: aprobar ? 'checkmark-circle-outline' : 'close-circle-outline',
      tono: aprobar ? 'normal' : 'peligro',
      textoConfirmar: aprobar ? 'Sí, aprobar' : 'Sí, rechazar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(async () => {
          await pedidosAdminService.resolverPago(pago.id, estado, nota);
          setNotasPago((n) => ({ ...n, [pago.id]: '' }));

          // Respaldo del flujo por si la base de datos no mueve el estado sola:
          const actual = (await pedidosAdminService.getPedido(pedidoId)).pedido.estado;
          // 1) Anticipo aprobado → el cliente ya puede subir su diseño.
          if (aprobar && pago.tipo_pago === 'ANTICIPO' && actual === 'PENDIENTE_VERIFICACION') {
            await pedidosAdminService.cambiarEstado(pedidoId, 'EN_DISENO');
          }
          // 2) Pago final rechazado → regresa a "Pendiente de pago final" para que el
          //    cliente pueda volver a pagar (el backend solo acepta el pago en ese estado).
          if (!aprobar && pago.tipo_pago !== 'ANTICIPO' && actual === 'VERIFICANDO_PAGO_FINAL') {
            await pedidosAdminService.cambiarEstado(pedidoId, 'PENDIENTE_PAGO_FINAL');
          }
        }, aprobar ? 'Pago aprobado correctamente' : 'Pago rechazado. El cliente podrá subir otro comprobante.');
      },
    });
  };

  // ---- Estado del pedido (mismas acciones que la web) ----
  const pedirMarcarListo = () =>
    setConfirmacion({
      titulo: 'Marcar como listo',
      mensaje: 'El pedido está terminado. Pasará a "Esperando pago final" y el cliente podrá pagar su saldo.',
      icono: 'cube-outline',
      tono: 'normal',
      textoConfirmar: 'Sí, marcar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(
          () => pedidosAdminService.cambiarEstado(pedidoId, 'PENDIENTE_PAGO_FINAL'),
          'Estado actualizado correctamente'
        );
      },
    });

  const pedirCancelar = () =>
    setConfirmacion({
      titulo: 'Cancelar pedido',
      mensaje: '¿Seguro que quieres cancelar este pedido? Esta acción no se puede deshacer.',
      icono: 'close-circle-outline',
      textoConfirmar: 'Sí, cancelar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(() => pedidosAdminService.cambiarEstado(pedidoId, 'CANCELADO'), 'Pedido cancelado');
      },
    });

  const pedirMarcarEnviado = () =>
    setConfirmacion({
      titulo: 'Marcar como enviado',
      mensaje: 'El pago está completo. El pedido se marcará como enviado / entregado al cliente.',
      icono: 'paper-plane-outline',
      tono: 'normal',
      textoConfirmar: 'Sí, marcar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(() => pedidosAdminService.cambiarEstado(pedidoId, 'ENVIADO'), 'Pedido marcado como enviado');
      },
    });

  // ---- Previas: una a la vez, hasta que el cliente apruebe ----
  const previas: PreviaAdmin[] = data?.previas ?? [];
  const estadoPedido = data?.pedido.estado;
  const ultimaPrevia = previas.length ? previas[previas.length - 1] : null;
  const estadoDe = (p: PreviaAdmin): EstadoPrevia => estadoPrevia(p);
  const ultimaRechazada = !!ultimaPrevia && ultimaPrevia.rechazada;
  const hayAprobada = previas.some((p) => p.aprobada);
  const siguientePrevia = (ultimaPrevia?.numero_previa ?? 0) + 1;

  // El cliente ya mandó su diseño (EN_REVISION) o rechazó la última previa. Al rechazar,
  // el backend NO cambia el estado del pedido: se queda en PREVIAS_ENVIADAS, por eso se
  // revisa la columna "rechazada". Si el cliente aprueba, el backend lo pasa a EN_PRODUCCION.
  const puedeEnviarPrevia =
    !hayAprobada && (estadoPedido === 'EN_REVISION' || (estadoPedido === 'PREVIAS_ENVIADAS' && ultimaRechazada));

  const bannerPrevias = useMemo<BannerPrevias | null>(() => {
    if (!ultimaPrevia) {
      return estadoPedido === 'EN_REVISION'
        ? { texto: 'Aún no hay previas. Envía la primera para que el cliente la revise.', tono: 'info' }
        : null;
    }
    const n = ultimaPrevia.numero_previa;
    if (hayAprobada) return { texto: `El cliente aprobó la previa ${previas.find((p) => p.aprobada)?.numero_previa ?? n}.`, tono: 'ok' };
    if (ultimaRechazada) return { texto: `El cliente rechazó la previa ${n}. Envía otra versión.`, tono: 'aviso' };
    return { texto: `Esperando la respuesta del cliente a la previa ${n}.`, tono: 'info' };
  }, [ultimaPrevia, previas, hayAprobada, ultimaRechazada, estadoPedido]);

  const elegirPrevia = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (r.canceled) return;
    const a = r.assets[0];
    const mimeType = a.mimeType ?? 'image/jpeg';
    if (!TIPOS_IMAGEN.includes(mimeType)) {
      mostrarAviso('Solo se permiten imágenes JPG, PNG o WEBP.', false);
      return;
    }
    setPrevia({
      uri: a.uri,
      name: a.fileName ?? `previa_${siguientePrevia}_${Date.now()}.jpg`,
      mimeType,
    });
  };

  const quitarPrevia = () => setPrevia(null);

  const pedirEnviarPrevia = () => {
    if (!previa) {
      mostrarAviso('Elige la imagen de la previa.', false);
      return;
    }
    const archivo = previa;
    const numero = siguientePrevia;
    setConfirmacion({
      titulo: `Enviar previa ${numero}`,
      mensaje: 'Se enviará al cliente para que la apruebe o la rechace.',
      icono: 'send-outline',
      tono: 'normal',
      textoConfirmar: 'Sí, enviar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(async () => {
          await pedidosAdminService.enviarPrevia(pedidoId, archivo, numero);
          setPrevia(null);
        }, `Previa ${numero} enviada correctamente`);
      },
    });
  };

  // ---- Próximo paso: qué le toca al admin ----
  const pagosOrdenados = useMemo(() => [...(data?.pagos ?? [])].sort((a, b) => b.id - a.id), [data]);
  const ultimoAnticipo = pagosOrdenados.find((p) => p.tipo_pago === 'ANTICIPO') ?? null;
  const ultimoFinal = pagosOrdenados.find((p) => p.tipo_pago !== 'ANTICIPO') ?? null;

  const proximoPaso = useMemo<ProximoPaso | null>(() => {
    if (!data) return null;
    switch (data.pedido.estado) {
      case 'PENDIENTE_VERIFICACION':
        if (ultimoAnticipo?.estado_pago === 'PENDIENTE') {
          return { tono: 'accion', icono: 'receipt-outline', titulo: 'Revisa el anticipo', texto: 'El cliente subió su comprobante. Apruébalo o recházalo.', destino: 'pagos' };
        }
        return ultimoAnticipo?.estado_pago === 'RECHAZADO'
          ? { tono: 'espera', icono: 'time-outline', titulo: 'Esperando nuevo comprobante', texto: 'Rechazaste el anticipo. El cliente debe subir otro.' }
          : { tono: 'espera', icono: 'time-outline', titulo: 'Esperando el anticipo', texto: 'El cliente todavía no paga el 50%.' };
      case 'EN_DISENO':
        return { tono: 'espera', icono: 'color-palette-outline', titulo: 'Esperando el diseño', texto: 'El cliente debe subir su logo o idea para cada producto.' };
      case 'EN_REVISION':
        return { tono: 'accion', icono: 'brush-outline', titulo: `Envía la previa ${siguientePrevia}`, texto: 'El cliente ya mandó su diseño. Prepara la propuesta y súbela.', destino: 'previas' };
      case 'PREVIAS_ENVIADAS':
        return ultimaRechazada
          ? { tono: 'accion', icono: 'refresh-outline', titulo: `El cliente pidió cambios`, texto: `Revisa su comentario y envía la previa ${siguientePrevia}.`, destino: 'previas' }
          : { tono: 'espera', icono: 'eye-outline', titulo: 'Esperando respuesta', texto: `El cliente está revisando la previa ${ultimaPrevia?.numero_previa ?? ''}.` };
      case 'EN_PRODUCCION':
        return {
          tono: 'accion', icono: 'construct-outline', titulo: 'En producción',
          texto: 'Cuando el pedido esté terminado, márcalo como listo para cobrar el saldo.',
          boton: { texto: 'Marcar como listo', icono: 'cube-outline', onPress: pedirMarcarListo },
        };
      case 'PENDIENTE_PAGO_FINAL':
      case 'VERIFICANDO_PAGO_FINAL':
        if (ultimoFinal?.estado_pago === 'PENDIENTE') {
          return { tono: 'accion', icono: 'cash-outline', titulo: 'Revisa el pago final', texto: 'El cliente subió el comprobante de su saldo.', destino: 'pagos' };
        }
        if (ultimoFinal?.estado_pago === 'APROBADO') {
          return {
            tono: 'accion', icono: 'paper-plane-outline', titulo: 'Pago completo',
            texto: 'Ya se pagó todo. Entrega o envía el pedido y márcalo como enviado.',
            boton: { texto: 'Marcar como enviado', icono: 'paper-plane-outline', onPress: pedirMarcarEnviado },
          };
        }
        return { tono: 'espera', icono: 'cash-outline', titulo: 'Esperando el pago final', texto: 'El cliente debe pagar el saldo restante.' };
      case 'ENVIADO':
        return { tono: 'listo', icono: 'checkmark-done-circle-outline', titulo: 'Pedido enviado', texto: 'Este pedido ya se completó.' };
      case 'CANCELADO':
        return { tono: 'cancelado', icono: 'close-circle-outline', titulo: 'Pedido cancelado', texto: 'No hay acciones pendientes.' };
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ultimoAnticipo, ultimoFinal, ultimaRechazada, siguientePrevia, ultimaPrevia]);

  return {
    pedidoId,
    proximoPaso,
    pagosOrdenados,
    data,
    cargando,
    refrescando,
    error,
    refrescar,
    reintentar: cargar,
    volver: () => (router.canGoBack() ? router.back() : router.replace('/(admin)/pedidos' as any)),
    abrirUrl: (url: string) => Linking.openURL(url).catch(() => mostrarAviso('No se pudo abrir el archivo.', false)),

    trabajando,
    aviso,
    confirmacion,
    cerrarConfirmacion,

    detalle,
    abrirDetalle,
    cerrarDetalle,

    notasPago,
    editarNotaPago,
    pedirResolverPago,

    pedirMarcarListo,
    pedirMarcarEnviado,
    pedirCancelar,
    puedeCancelar: !!estadoPedido && estadoPedido !== 'CANCELADO' && estadoPedido !== 'ENVIADO',

    previa,
    siguientePrevia,
    puedeEnviarPrevia,
    bannerPrevias,
    estadoDePrevia: estadoDe,
    elegirPrevia,
    quitarPrevia,
    pedirEnviarPrevia,
  };
};
