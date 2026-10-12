import { useState, useEffect, useRef } from 'react';
import type { ClientProductDetail, Variante, PortafolioReferencia } from '../models/ClientProductDetail';
import { clientProductDetailService } from '../services/clientProductDetailService';

const CANTIDAD_MAXIMA = 99;

export const useClientProductDetailViewModel = (productId: string | number, colorInicial?: string) => {
  const [producto, setProducto] = useState<ClientProductDetail | null>(null);
  const [varianteActiva, setVarianteActiva] = useState<Variante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [cantidad, setCantidad] = useState<number>(1);
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<Record<string, string>>({});
  const [portafolio, setPortafolio] = useState<PortafolioReferencia[]>([]);
  const [modalPortafolio, setModalPortafolio] = useState<{ url: string; descripcion?: string } | null>(null);

  const [agregando, setAgregando] = useState<boolean>(false);
  const [agregado, setAgregado] = useState<boolean>(false);
  const [errorCarrito, setErrorCarrito] = useState<string>('');

  const avisoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (avisoTimer.current) clearTimeout(avisoTimer.current);
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await clientProductDetailService.getProductDetail(productId);
        if (cancelado) return;
        setProducto(data);

        if (data.variantes?.length > 0) {
          const encontrada = data.variantes.find((v) => v.color === colorInicial);
          setVarianteActiva(encontrada || data.variantes[0]);
        }
      } catch (err) {
        console.error(err);
        if (!cancelado) setError('No se pudo cargar la información del producto.');
      } finally {
        if (!cancelado) setLoading(false);
      }

      // El portafolio es un extra: si falla, el producto se muestra igual.
      try {
        const refs = await clientProductDetailService.getProductPortafolio(productId);
        if (!cancelado) setPortafolio(refs);
      } catch {
        if (!cancelado) setPortafolio([]);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [productId, colorInicial]);

  const coloresUnicos = producto
    ? Array.from(new Map(producto.variantes.map((v) => [v.color, v])).values())
    : [];

  const variantesDelColor =
    producto && varianteActiva ? producto.variantes.filter((v) => v.color === varianteActiva.color) : [];

  const atributosAgrupados = variantesDelColor.reduce((acc: Record<string, Set<string>>, v) => {
    (v.atributos || []).forEach(({ tipo, valor }) => {
      if (!acc[tipo]) acc[tipo] = new Set();
      acc[tipo].add(valor);
    });
    return acc;
  }, {});

  const seleccionarColor = (variante: Variante) => {
    setVarianteActiva(variante);
    setAtributosSeleccionados({});
  };

  const seleccionarAtributo = (tipo: string, valor: string) => {
    setAtributosSeleccionados((prev) => ({ ...prev, [tipo]: valor }));
  };

  const incrementar = () => setCantidad((c) => Math.min(c + 1, CANTIDAD_MAXIMA));
  const decrementar = () => setCantidad((c) => Math.max(c - 1, 1));

  const precioFinal = producto
    ? Number(producto.precio_base) + Number(varianteActiva?.precio_adicional || 0)
    : 0;
  const precioTotal = precioFinal * cantidad;

  const atributosPendientes = Object.keys(atributosAgrupados).filter((tipo) => !atributosSeleccionados[tipo]);
  const puedeAgregar = atributosPendientes.length === 0 && varianteActiva !== null;

  const agregarAlCarrito = async (onUnauthorized?: () => void) => {
    if (!puedeAgregar || !varianteActiva) return;
    setAgregando(true);
    setErrorCarrito('');
    try {
      await clientProductDetailService.addToCart(varianteActiva.variante_id, cantidad);
      setAgregado(true);
      if (avisoTimer.current) clearTimeout(avisoTimer.current);
      avisoTimer.current = setTimeout(() => setAgregado(false), 3000);
    } catch (err: any) {
      console.error('Error al agregar al carrito:', err);
      if (err.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      } else {
        setErrorCarrito('No se pudo agregar al carrito. Intenta de nuevo.');
      }
    } finally {
      setAgregando(false);
    }
  };

  return {
    producto,
    varianteActiva,
    loading,
    error,
    cantidad,
    incrementar,
    decrementar,
    modalPortafolio,
    abrirModalPortafolio: (url: string, descripcion?: string) => setModalPortafolio({ url, descripcion }),
    cerrarModalPortafolio: () => setModalPortafolio(null),
    coloresUnicos,
    atributosAgrupados,
    atributosSeleccionados,
    seleccionarColor,
    seleccionarAtributo,
    precioFinal,
    precioTotal,
    puedeAgregar,
    atributosPendientes,
    portafolio,
    agregando,
    agregado,
    errorCarrito,
    agregarAlCarrito,
  };
};
