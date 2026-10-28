import { useCallback, useEffect, useState } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/shared/hooks/useAuth';
import { pagoService } from '../services/pagoService';
import { pdfService } from '../services/pdfService'; // PDF
import { folioDe, modoDePago, textoParaCompartir } from '../utils/pagoUtils';
import { htmlFichaPago, nombreArchivoPdf } from '../utils/pagoPdf'; // PDF
import type { ArchivoComprobante, PantallaPago } from '../models/Pago';

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export const usePagoPedidoViewModel = (pedidoId: number) => {
  const router = useRouter();
  const { user } = useAuth();

  const [infoPdf, setInfoPdf] = useState<string | null>(null);
  const [pantalla, setPantalla] = useState<PantallaPago | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [archivo, setArchivo] = useState<ArchivoComprobante | null>(null);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [generandoPdf, setGenerandoPdf] = useState(false); // PDF
  const [errorPdf, setErrorPdf] = useState<string | null>(null); // PDF

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setError(null);
    try {
      setPantalla(await pagoService.getPantalla(pedidoId));
    } catch (e) {
      console.error('Error al cargar pago:', e);
      setError('No se pudo cargar el pedido.');
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useEffect(() => { cargar(); }, [cargar]);

  const modo = modoDePago(pantalla?.metodo ?? null);
  const esTienda = modo === 'TIENDA';
  const pagoExistente = pantalla?.pedido.pagos.find((p) => p.tipo_pago === 'ANTICIPO') ?? null;
  const puedePagar = pantalla?.pedido.estado === 'PENDIENTE_VERIFICACION' && !pagoExistente;

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
    aceptar({
      uri: a.uri,
      name: a.fileName ?? `comprobante_${Date.now()}.jpg`,
      mimeType: a.mimeType ?? 'image/jpeg',
      size: a.fileSize,
    });
  };

  const desdeArchivo = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (r.canceled) return;
    const a = r.assets[0];
    aceptar({ uri: a.uri, name: a.name, mimeType: a.mimeType ?? 'application/pdf', size: a.size });
  };

  const enviar = async () => {
    if (!pantalla || enviando) return;
    if (!esTienda && !archivo) return setErrorEnvio('Selecciona tu comprobante de pago.');
    if (!user) return;

    setEnviando(true);
    setErrorEnvio(null);
    try {
      await pagoService.registrarAnticipo({
        pedido: pantalla.pedido,
        archivo: esTienda ? null : archivo,
        nota,
        usuarioId: user.id_usuario,
        nombreCliente: user.nombre,
      });
      setArchivo(null);
      await cargar(true); // ahora aparece el pago registrado
    } catch (e: any) {
      setErrorEnvio(e?.response?.data?.message ?? e?.message ?? 'No se pudo registrar el pago.');
    } finally {
      setEnviando(false);
    }
  };

  const compartir = () =>
    pantalla && user
      ? Share.share({ title: `Pedido ${folioDe(pantalla.pedido.id)}`, message: textoParaCompartir(pantalla, user.nombre) })
      : undefined;

  // PDF: genera la ficha y abre el menú para guardarla/compartirla
    // PDF: genera la ficha y la guarda en la carpeta que el usuario elija
  const descargarPdf = async () => {
    if (!pantalla || generandoPdf) return;
    setGenerandoPdf(true);
    setErrorPdf(null);
    setInfoPdf(null);

    const html = htmlFichaPago(pantalla, user?.nombre ?? 'Cliente');
    try {
      const r = await pdfService.descargar(html, nombreArchivoPdf(pantalla.pedido.id));
      if (r.estado === 'guardado') {
        setInfoPdf(`Ficha guardada en la carpeta "${r.carpeta}"`);
      }
    } catch (e) {
      // Plan B: si no se pudo guardar directo, abrimos el diálogo de impresión (Guardar como PDF)
      console.warn('Guardado directo falló, usando el diálogo de impresión:', e);
      try {
        await pdfService.imprimir(html);
      } catch (e2: any) {
        console.error('Error al generar PDF:', e2);
        setErrorPdf(e2?.message ?? 'No se pudo generar el PDF.');
      }
    } finally {
      setGenerandoPdf(false);
    }
  };

  return {
    pantalla, cargando, error, reintentar: () => cargar(),
    modo, esTienda, pagoExistente, puedePagar,
    cliente: user?.nombre ?? 'Cliente',
    archivo, quitarArchivo: () => setArchivo(null), desdeGaleria, desdeArchivo,
    nota, setNota, enviando, errorEnvio, enviar, compartir,
    generandoPdf, errorPdf, infoPdf, descargarPdf,
    irAPedidos: () => router.replace('/(cliente)/pedidos' as any),
     volver: () => (router.canGoBack() ? router.back() : router.replace('/(cliente)/pedidos' as any)),
  };
};