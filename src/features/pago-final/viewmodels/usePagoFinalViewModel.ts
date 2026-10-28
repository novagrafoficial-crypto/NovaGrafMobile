import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/shared/hooks/useAuth';
import { modoDePago } from '@/features/pago/utils/pagoUtils';
import { pagoFinalService } from '../services/pagoFinalService';
import { pdfService } from '@/features/pago/services/pdfService';
import { htmlReciboPagoFinal, nombreReciboPdf } from '../utils/reciboPagoFinal';
import type { ArchivoComprobante, PantallaPagoFinal } from '../models/PagoFinal';

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

/** Qué pantalla mostrar según el estado del pedido. */
export type VistaPagoFinal = 'pagar' | 'enviado' | 'noDisponible';

export const usePagoFinalViewModel = (pedidoId: number) => {
  const router = useRouter();
  const { user } = useAuth();

  const [pantalla, setPantalla] = useState<PantallaPagoFinal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [archivo, setArchivo] = useState<ArchivoComprobante | null>(null);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  // Recibo en PDF
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [infoPdf, setInfoPdf] = useState<string | null>(null);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setError(null);
    try {
      setPantalla(await pagoFinalService.getPantalla(pedidoId));
    } catch (e) {
      console.error('Error al cargar pago final:', e);
      setError('No se pudo cargar la información del pago.');
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  // Se recarga cada vez que entras (por si el admin aprobó o rechazó algo mientras tanto)
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const modo = modoDePago(pantalla?.metodo ?? null);
  const esTienda = modo === 'TIENDA';
  const estado = pantalla?.pedido.estado;
  const finalPendiente = pantalla?.pagoFinal?.estado_pago === 'PENDIENTE';

  const vista: VistaPagoFinal =
    estado === 'VERIFICANDO_PAGO_FINAL' || (estado === 'PENDIENTE_PAGO_FINAL' && finalPendiente)
      ? 'enviado'
      : estado === 'PENDIENTE_PAGO_FINAL' && (pantalla?.montoPendiente ?? 0) > 0
        ? 'pagar'
        : 'noDisponible';

  // Si el admin rechazó el comprobante anterior, se lo mostramos al cliente
  const rechazoAnterior =
    pantalla?.pagoFinal?.estado_pago === 'RECHAZADO' ? pantalla.pagoFinal : null;

  // ── Selección del comprobante ─────────────────────────────
  const aceptar = (a: ArchivoComprobante) => {
    if (a.size && a.size > MAX_BYTES) return setErrorEnvio('El archivo no debe superar los 5 MB.');
    if (!TIPOS.includes(a.mimeType)) return setErrorEnvio('Solo se permiten archivos JPG, PNG o PDF.');
    setErrorEnvio(null);
    setArchivo(a);
  };

  const desdeGaleria = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (r.canceled) return;
    const a = r.assets[0];
    aceptar({ uri: a.uri, name: a.fileName ?? `comprobante_${Date.now()}.jpg`, mimeType: a.mimeType ?? 'image/jpeg', size: a.fileSize });
  };

  const desdeArchivo = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (r.canceled) return;
    const a = r.assets[0];
    aceptar({ uri: a.uri, name: a.name, mimeType: a.mimeType ?? 'application/pdf', size: a.size });
  };

  // ── Envío ─────────────────────────────────────────────────
  const registrar = async () => {
    if (!pantalla || !user) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await pagoFinalService.registrar({
        pantalla,
        archivo: esTienda ? null : archivo,
        nota,
        usuarioId: user.id_usuario,
        nombreCliente: user.nombre,
      });
      setArchivo(null);
      setNota('');
      await cargar(true); // ahora se muestra la pantalla de "enviado"
    } catch (e: any) {
      setErrorEnvio(e?.response?.data?.message ?? e?.message ?? 'No se pudo registrar el pago.');
    } finally {
      setEnviando(false);
    }
  };

  // Paso 1: validar y abrir el modal de confirmación (con el diseño de la app)
  const enviar = () => {
    if (!pantalla || enviando) return;
    if (!esTienda && !archivo) return setErrorEnvio('Selecciona tu comprobante de pago.');
    setErrorEnvio(null);
    setConfirmarVisible(true);
  };

  // Paso 2: el cliente confirma en el modal
  const confirmarEnvio = async () => {
    await registrar();
    setConfirmarVisible(false);
  };

  // Recibo del pago final en PDF (mismo servicio que la ficha del anticipo)
  const descargarRecibo = async () => {
    if (!pantalla || generandoPdf) return;
    setGenerandoPdf(true);
    setErrorPdf(null);
    setInfoPdf(null);
    const html = htmlReciboPagoFinal(pantalla, user?.nombre ?? 'Cliente');
    try {
      const r = await pdfService.descargar(html, nombreReciboPdf(pantalla.pedido.id));
      if (r.estado === 'guardado') setInfoPdf(`Recibo guardado en la carpeta "${r.carpeta}"`);
    } catch {
      // Si Android no deja guardar directo, se abre el diálogo para "Guardar como PDF"
      try {
        await pdfService.imprimir(html);
      } catch (e: any) {
        setErrorPdf(e?.message ?? 'No se pudo generar el recibo.');
      }
    } finally {
      setGenerandoPdf(false);
    }
  };

  const comprobanteUrl =
    pantalla?.pagoFinal?.comprobante_url && pantalla.pagoFinal.comprobante_url !== 'TIENDA_FISICA'
      ? pantalla.pagoFinal.comprobante_url
      : null;

  return {
    pantalla, cargando, error, reintentar: () => cargar(),
    vista, modo, esTienda, rechazoAnterior,
    cliente: user?.nombre ?? 'Cliente',
    archivo, quitarArchivo: () => setArchivo(null), desdeGaleria, desdeArchivo,
    nota, setNota, enviando, errorEnvio, enviar,
    // Modal de confirmación
    confirmarVisible, confirmarEnvio, cancelarConfirmacion: () => setConfirmarVisible(false),
    // Después de enviar
    comprobanteUrl,
    verComprobante: () => comprobanteUrl && Linking.openURL(comprobanteUrl),
    generandoPdf, infoPdf, errorPdf, descargarRecibo,
    // Regresa a la pantalla anterior (el detalle del pedido); si no hay historial, va al detalle
    volver: () => (router.canGoBack() ? router.back() : router.replace(`/(cliente)/pedido/${pedidoId}` as any)),
    irAlPedido: () => router.replace(`/(cliente)/pedido/${pedidoId}` as any),
  };
};