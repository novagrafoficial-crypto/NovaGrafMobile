import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { pedidosAdminService } from '../services/pedidosAdminService';
import { estadoPrevia, type EstadoPrevia } from '../utils/pedidoAdminUtils';
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
  onConfirmar: () => void;
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
    // Si el admin no escribe nada, se conserva la nota que ya tenía el pago.
    const nota = (notasPago[pago.id] ?? '').trim() || pago.notas_admin || '';
    setConfirmacion({
      titulo: aprobar ? 'Aprobar pago' : 'Rechazar pago',
      mensaje: aprobar
        ? `¿Confirmas que el comprobante de ${pago.tipo_pago} es válido?`
        : `¿Seguro que quieres rechazar el comprobante de ${pago.tipo_pago}?`,
      icono: aprobar ? '✅' : '❌',
      textoConfirmar: aprobar ? 'Sí, aprobar' : 'Sí, rechazar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(
          () => pedidosAdminService.resolverPago(pago.id, estado, nota),
          aprobar ? 'Pago aprobado correctamente' : 'Pago rechazado correctamente'
        );
      },
    });
  };

  // ---- Estado del pedido (mismas acciones que la web) ----
  const pedirMarcarListo = () =>
    setConfirmacion({
      titulo: 'Marcar como listo',
      mensaje: 'El pedido pasará a "Pendiente de pago final".',
      icono: '📦',
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
      mensaje: '¿Seguro que quieres cancelar este pedido?',
      icono: '⚠️',
      textoConfirmar: 'Sí, cancelar',
      onConfirmar: () => {
        setConfirmacion(null);
        ejecutar(() => pedidosAdminService.cambiarEstado(pedidoId, 'CANCELADO'), 'Pedido cancelado');
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
      icono: '📤',
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

  return {
    pedidoId,
    data,
    cargando,
    refrescando,
    error,
    refrescar,
    reintentar: cargar,
    volver: () => router.back(),
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
    pedirCancelar,

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
