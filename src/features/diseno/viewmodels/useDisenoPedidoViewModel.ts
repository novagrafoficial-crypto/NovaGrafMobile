import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/shared/hooks/useAuth';
import { pedidoService } from '@/features/pedidos/services/pedidoService';
import type { Pedido } from '@/features/pedidos/models/Pedido';
import { disenoService } from '../services/disenoService';
import type { ArchivoDiseno } from '../models/Diseno';

const MAX_BYTES = 10 * 1024 * 1024; // igual que la web (10 MB)
const esPermitido = (mime: string) => mime.startsWith('image/') || mime === 'application/pdf';

export const useDisenoPedidoViewModel = (pedidoId: number) => {
  const router = useRouter();
  const { user } = useAuth();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Todo se guarda por variante_id: cada producto tiene su propio diseño y notas
  const [archivos, setArchivos] = useState<Record<number, ArchivoDiseno>>({});
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
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

  useEffect(() => { cargar(); }, [cargar]);

  const aceptar = (varianteId: number, a: ArchivoDiseno) => {
    if (a.size && a.size > MAX_BYTES) return setErrorEnvio('El archivo no debe superar los 10 MB.');
    if (!esPermitido(a.mimeType)) return setErrorEnvio('Solo se permiten imágenes o PDF.');
    setErrorEnvio(null);
    setArchivos((prev) => ({ ...prev, [varianteId]: a }));
  };

  const desdeGaleria = async (varianteId: number) => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (r.canceled) return;
    const a = r.assets[0];
    aceptar(varianteId, {
      uri: a.uri,
      name: a.fileName ?? `diseno_${Date.now()}.jpg`,
      mimeType: a.mimeType ?? 'image/jpeg',
      size: a.fileSize,
    });
  };

  const desdeArchivo = async (varianteId: number) => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (r.canceled) return;
    const a = r.assets[0];
    aceptar(varianteId, { uri: a.uri, name: a.name, mimeType: a.mimeType ?? 'application/pdf', size: a.size });
  };

  const quitar = (varianteId: number) =>
    setArchivos((prev) => {
      const copia = { ...prev };
      delete copia[varianteId];
      return copia;
    });

  const cambiarNotas = (varianteId: number, texto: string) =>
    setNotas((prev) => ({ ...prev, [varianteId]: texto }));

  const total = pedido?.detalles.length ?? 0;
  const listos = pedido ? pedido.detalles.filter((d) => archivos[d.variante_id]).length : 0;
  const puedeSubir = pedido?.estado === 'EN_DISENO';
  const completo = total > 0 && listos === total;

  const enviar = async () => {
    if (!pedido || !user || enviando) return;
    if (!completo) return setErrorEnvio('Sube el diseño de todos los productos para continuar.');

    setEnviando(true);
    setErrorEnvio(null);
    try {
      await disenoService.enviar({ pedido, archivos, notas, usuarioId: user.id_usuario });
      setEnviado(true);
    } catch (e: any) {
      setErrorEnvio(e?.response?.data?.message ?? e?.message ?? 'No se pudieron enviar los diseños.');
    } finally {
      setEnviando(false);
    }
  };

  return {
    pedido, cargando, error, reintentar: cargar,
    archivos, notas, total, listos, completo, puedeSubir,
    desdeGaleria, desdeArchivo, quitar, cambiarNotas,
    enviando, errorEnvio, enviado, enviar,
    verPedido: () => router.replace(`/(cliente)/pedido/${pedidoId}` as any),
    volver: () => (router.canGoBack() ? router.back() : router.replace(`/(cliente)/pedido/${pedidoId}` as any)),
  };
};