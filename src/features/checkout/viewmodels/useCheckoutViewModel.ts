import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '@/features/carrito';
import { checkoutService } from '../services/checkoutService';
import { CATEGORIAS_BASE, PASOS_CHECKOUT } from '../models/Checkout';
import type { CategoriaEntrega, CategoriaKey, CheckoutOptions } from '../models/Checkout';

export const useCheckoutViewModel = () => {
  const router = useRouter();
  const { items, total: subtotal, refreshCart } = useCart();

  const [opciones, setOpciones] = useState<CheckoutOptions | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [categoria, setCategoria] = useState<CategoriaKey | null>(null);
  const [entregaId, setEntregaId] = useState<number | null>(null);
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [direccion, setDireccion] = useState('');

  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      setOpciones(await checkoutService.getOptions());
    } catch (e) {
      console.error('Error al cargar checkout:', e);
      setErrorCarga('No se pudieron cargar los métodos de entrega y pago.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Solo categorías que tengan opciones (igual que la web)
  const categorias = useMemo<CategoriaEntrega[]>(() => {
    if (!opciones) return [];
    const mapa: Record<CategoriaKey, CheckoutOptions['tiendas']> = {
      TIENDA: opciones.tiendas,
      PUNTO_MEDIO: opciones.puntosMedios,
      ENVIO_LOCAL: opciones.colonias,
    };
    return CATEGORIAS_BASE.map((c) => ({ ...c, opciones: mapa[c.key] })).filter(
      (c) => c.opciones.length > 0
    );
  }, [opciones]);

  const categoriaActual = categorias.find((c) => c.key === categoria) ?? null;
  const entrega = categoriaActual?.opciones.find((o) => o.id === entregaId) ?? null;
  const pago = opciones?.metodosPago.find((m) => m.id === pagoId) ?? null;
  const esEnvioLocal = entrega?.tipo === 'ENVIO_LOCAL';

  // Mismos cálculos que pedidoModel.crearPedidoDesdeCarrito (solo para mostrar)
  const costoEnvio = entrega?.costo ?? 0;
  const totalGeneral = subtotal + costoEnvio;
  const montoAnticipo = totalGeneral * 0.5;
  const montoRestante = totalGeneral * 0.5;

  const elegirCategoria = (key: CategoriaKey) => {
    setCategoria(key);
    setEntregaId(null);
    setDireccion('');
    setErrorEnvio(null);
  };

    // Validación por paso: no deja avanzar si falta algo de ese paso
  const validarEntrega = (): string | null => {
    if (!categoria) return 'Elige cómo quieres recibir tu pedido.';
    if (!entrega) return 'Selecciona una opción de entrega.';
    if (esEnvioLocal && direccion.trim().length < 5)
      return 'Escribe una dirección completa (mínimo 5 caracteres).';
    return null;
  };
  const validarPago = (): string | null => (!pago ? 'Selecciona un método de pago.' : null);
  const validar = (): string | null => validarEntrega() ?? validarPago();

  const siguiente = () => {
    const msg = paso === 1 ? validarEntrega() : paso === 2 ? validarPago() : null;
    if (msg) return setErrorEnvio(msg);
    setErrorEnvio(null);
    setPaso((p) => Math.min(p + 1, PASOS_CHECKOUT.length - 1));
  };

  const atras = () => {
    setErrorEnvio(null);
    if (paso > 0) setPaso((p) => p - 1);
    else router.back();
  };

  // Desde el resumen se puede saltar a corregir un paso
  const irAPaso = (n: number) => {
    setErrorEnvio(null);
    setPaso(n);
  };

  const confirmar = async () => {
    if (enviando) return;
    const msg = validar();
    if (msg) return setErrorEnvio(msg);

    setEnviando(true);
    setErrorEnvio(null);
    try {
      // Tienda / punto medio: la "dirección" es la descripción de la opción (como en la web)
      const direccion_envio = esEnvioLocal
        ? direccion.trim()
        : entrega!.descripcion || 'Dirección disponible en la confirmación del pedido';

      const pedidoId = await checkoutService.crearPedido({
        metodo_entrega_id: entrega!.id,
        metodo_pago_id: pago!.id,
        direccion_envio,
      });

      // Primero navegamos, luego vaciamos el estado local (evita ver "carrito vacío" un instante)
      router.replace(`/(cliente)/pago-pedido/${pedidoId}` as any);
      refreshCart(true);
       } catch (e: any) {
      setErrorEnvio(e?.response?.data?.message ?? 'No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return {
    items, subtotal, cargando, errorCarga, reintentar: cargar,
    categorias, categoria, elegirCategoria, categoriaActual,
    entregaId, elegirEntrega: (id: number) => { setEntregaId(id); setErrorEnvio(null); },
    metodosPago: opciones?.metodosPago ?? [], pagoId, elegirPago: (id: number) => { setPagoId(id); setErrorEnvio(null); },
    esEnvioLocal, direccion, setDireccion,
    costoEnvio, totalGeneral, montoAnticipo, montoRestante,
    enviando, errorEnvio, confirmar,
    paso, pasos: PASOS_CHECKOUT, siguiente, atras, irAPaso,
    esUltimoPaso: paso === PASOS_CHECKOUT.length - 1,
    entrega, pago,
    volver: atras,
    irAlCatalogo: () => router.replace('/(cliente)/productos-base' as any),
  };
};