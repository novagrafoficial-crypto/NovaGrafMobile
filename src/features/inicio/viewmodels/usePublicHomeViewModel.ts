import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { catalogoPublicoService } from '@/features/catalogo-publico';
import type { DetallePublico, ProductoPublico } from '@/features/catalogo-publico';
import { portfolioService } from '@/features/portafolio/services/portfolioService';
import type { PortfolioItem } from '@/features/portafolio';
import { splitDescripcion } from '@/features/portafolio/utils/splitDescripcion';

// Solo unos cuantos en el inicio (lo demás está en Catálogo): así carga rápido y no se traba.
const MAX_PRODUCTOS = 8;
const MAX_TRABAJOS = 8;

export const usePublicHomeViewModel = () => {
  const router = useRouter();
  const [productos, setProductos] = useState<ProductoPublico[]>([]);
  const [trabajos, setTrabajos] = useState<PortfolioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetallePublico | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    // Las dos peticiones en paralelo; si una falla, la otra se muestra igual
    const [p, t] = await Promise.allSettled([catalogoPublicoService.getProductos(), portfolioService.getPublic()]);
    if (p.status === 'fulfilled') setProductos(p.value);
    if (t.status === 'fulfilled') setTrabajos(t.value);
    if (p.status === 'rejected' && t.status === 'rejected') setError('No pudimos cargar la información. Revisa tu conexión.');
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((x) => x.categoria).filter(Boolean) as string[])).slice(0, 8),
    [productos]
  );

  const ir = (ruta: string) => {
    setDetalle(null);
    router.push(ruta as any);
  };

  return {
    cargando,
    refrescando,
    error,
    productos: productos.slice(0, MAX_PRODUCTOS),
    hayMasProductos: productos.length > MAX_PRODUCTOS,
    trabajos: trabajos.slice(0, MAX_TRABAJOS),
    categorias,
    refrescar: async () => {
      setRefrescando(true);
      await cargar();
      setRefrescando(false);
    },
    detalle,
    cerrarDetalle: () => setDetalle(null),
    abrirProducto: (p: ProductoPublico) =>
      setDetalle({ titulo: p.nombre, imagenUrl: p.imagenUrl, categoria: p.categoria, descripcion: p.descripcion, precio: p.precioBase, colores: p.colores }),
    abrirTrabajo: (t: PortfolioItem) => {
      const partes = splitDescripcion(t.descripcion);
      setDetalle({
        titulo: t.productoNombre || partes.titulo || 'Trabajo personalizado',
        imagenUrl: t.imagenUrl,
        categoria: t.categoriaNombre,
        descripcion: (t.productoNombre ? t.descripcion : partes.detalle) || 'Hecho a la medida en nuestro taller.',
        precio: null,
        colores: [],
      });
    },
    verCatalogo: (categoria?: string) =>
      ir(categoria ? `/(public)/catalogo?categoria=${encodeURIComponent(categoria)}` : '/(public)/catalogo'),
    entrar: () => ir('/(auth)/login'),
    registrarse: () => ir('/(auth)/register'),
  };
};
