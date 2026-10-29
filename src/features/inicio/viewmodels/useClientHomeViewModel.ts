import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ofertasService, fechaCorta, mejorOferta, textoDescuento } from '@/features/ofertas';
import type { Oferta, OfertaTarjeta } from '@/features/ofertas';
import { usePortfolioViewModel } from '@/features/portafolio';
import type { PortfolioItem } from '@/features/portafolio';
import { clientProductService } from '@/features/catalogo-cliente';
import { useAuth } from '@/shared/hooks/useAuth';

const LIMITE_OFERTAS = 6; 
const LOTE_PORTAFOLIO = 6;

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

export const useClientHomeViewModel = () => {
  const router = useRouter();
  const { user } = useAuth();
  const portafolio = usePortfolioViewModel(); // trabajos personalizados (inspiración)

  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [cargandoOfertas, setCargandoOfertas] = useState<boolean>(true);
  const [errorOfertas, setErrorOfertas] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaPorProducto, setCategoriaPorProducto] = useState<Record<string, string>>({});
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const [busqueda, setBusqueda] = useState<string>('');
  const [categoria, setCategoria] = useState<string>(''); // '' = Todo
  const [verTodas, setVerTodas] = useState<boolean>(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cargar = useCallback(async (esRefresco = false) => {
    if (esRefresco) setRefrescando(true);
    else setCargandoOfertas(true);
    setErrorOfertas(null);

    // Ofertas y catálogo en paralelo; el catálogo solo sirve para las categorías
    const [resOfertas, resCatalogo] = await Promise.allSettled([
      ofertasService.getOfertas(),
      clientProductService.getProducts(),
    ]);

    if (resOfertas.status === 'fulfilled') setOfertas(resOfertas.value);
    else setErrorOfertas('No se pudieron cargar las promociones.');

    if (resCatalogo.status === 'fulfilled') {
      const mapa: Record<string, string> = {};
      const lista: string[] = [];
      resCatalogo.value.forEach((p) => {
        if (!p.categoria) return;
        mapa[String(p.producto_id)] = p.categoria;
        if (!lista.some((c) => norm(c) === norm(p.categoria))) lista.push(p.categoria);
      });
      setCategoriaPorProducto(mapa);
      setCategorias(lista);
    }

    setCargandoOfertas(false);
    setRefrescando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // ── Promociones: una tarjeta por variante, ya filtradas ──
  const tarjetas = useMemo<OfertaTarjeta[]>(
    () =>
      ofertas.flatMap((o) =>
        o.variantes.map((v) => ({
          clave: `${o.id}-${v.variante_id}`,
          productoId: v.producto_id,
          productoNombre: v.producto_nombre,
          color: v.color,
          imagen: v.imagen,
          descuentoTexto: textoDescuento(o.tipo, o.valor),
          precioOriginal: v.precio_original,
          precioFinal: v.precio_final,
          cantidadMinima: o.cantidad_minima,
          ofertaNombre: o.nombre,
        }))
      ),
    [ofertas]
  );

  const coincide = useCallback(
    (textos: (string | null | undefined)[], cat: string | null | undefined) => {
      const q = norm(busqueda);
      const okTexto = !q || textos.some((t) => norm(t).includes(q));
      const okCategoria = !categoria || norm(cat) === norm(categoria);
      return okTexto && okCategoria;
    },
    [busqueda, categoria]
  );

  const tarjetasFiltradas = useMemo(
    () =>
      tarjetas.filter((t) =>
        coincide([t.productoNombre, t.ofertaNombre, t.color], categoriaPorProducto[String(t.productoId)])
      ),
    [tarjetas, coincide, categoriaPorProducto]
  );

  const tarjetasVisibles = verTodas ? tarjetasFiltradas : tarjetasFiltradas.slice(0, LIMITE_OFERTAS);
  const hayMasOfertas = tarjetasFiltradas.length > LIMITE_OFERTAS;

  // ── Banner con la mejor oferta ──
  const banner = useMemo(() => {
    const mejor = mejorOferta(ofertas);
    if (!mejor) return null;
    const titulo =
      mejor.tipo === 'porcentaje'
        ? `Hasta ${Number.isInteger(mejor.valor) ? mejor.valor : mejor.valor.toFixed(1)}% de descuento`
        : `Ahorra hasta $${mejor.valor.toFixed(2)}`;
    const hasta = fechaCorta(mejor.fecha_fin);
    return { titulo, subtitulo: mejor.nombre, vigencia: hasta ? `Válida hasta el ${hasta}` : '' };
  }, [ofertas]);

  // ── Inspiración: trabajos personalizados filtrados por la misma búsqueda y categoría ──
  const portafolioFiltrado = useMemo(
    () =>
      portafolio.items.filter((i) =>
        coincide([i.productoNombre, i.descripcion, i.categoriaNombre], i.categoriaNombre)
      ),
    [portafolio.items, coincide]
  );
    // Se muestran de 6 en 6: muchas fotos a la vez hacen que el scroll se trabe
  const [cantidadPortafolio, setCantidadPortafolio] = useState<number>(LOTE_PORTAFOLIO);
  useEffect(() => { setCantidadPortafolio(LOTE_PORTAFOLIO); }, [busqueda, categoria]);
  const portafolioVisible = portafolioFiltrado.slice(0, cantidadPortafolio);
  const hayMasPortafolio = portafolioFiltrado.length > cantidadPortafolio;
  const verMasPortafolio = () => setCantidadPortafolio((n) => n + LOTE_PORTAFOLIO);

  const avisar = (texto: string) => {
    setAviso(texto);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 2500);
  };

  const elegirCategoria = (nueva: string) => {
    setCategoria(nueva);
    setVerTodas(false);
  };

  return {
    // búsqueda y categorías
    primerNombre: user?.nombre?.trim().split(/\s+/)[0] ?? '',
    busqueda,
    setBusqueda,
    categorias,
    categoria,
    elegirCategoria,
    // promociones
    banner,
    tarjetasVisibles,
    hayMasOfertas,
    verTodas,
    alternarVerTodas: () => setVerTodas((v) => !v),
    cargandoOfertas,
    errorOfertas,
    hayFiltros: busqueda.trim() !== '' || categoria !== '',
    sinOfertasActivas: tarjetas.length === 0,
    // inspiración
    portafolioFiltrado,
        portafolioVisible,
    hayMasPortafolio,
    verMasPortafolio,
    portafolioCargando: portafolio.isLoading,
    portafolioError: portafolio.error,
    recargarPortafolio: portafolio.reload,
    // general
    refrescando,
    refrescar: async () => {
      await Promise.all([cargar(true), portafolio.reload()]);
    },
    reintentarOfertas: () => cargar(),
    aviso,
    abrirOferta: (t: OfertaTarjeta) =>
      router.push(
        `/(cliente)/producto/${t.productoId}?colorSeleccionado=${encodeURIComponent(t.color)}` as any
      ),
    irAlCatalogo: () => router.push('/(cliente)/productos-base' as any),
    // Al tocar un trabajo: va al producto base con el que se hizo; si no hay, al catálogo
    abrirTrabajo: (item: PortfolioItem) =>
      item.productoId
        ? router.push(`/(cliente)/producto/${item.productoId}` as any)
        : router.push('/(cliente)/productos-base' as any),
    abrirNotificaciones: () => router.push('/(cliente)/notificaciones' as any),
    abrirChat: () => avisar('Chat disponible en pedidos.'),
  };
};