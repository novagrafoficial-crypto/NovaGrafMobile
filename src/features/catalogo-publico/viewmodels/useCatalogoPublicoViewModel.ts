import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { catalogoPublicoService } from '../services/catalogoPublicoService';
import type { DetallePublico, ProductoPublico } from '../models/ProductoPublico';

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const useCatalogoPublicoViewModel = () => {
  const router = useRouter();
  // Desde el Inicio se puede llegar con ?categoria=Tazas
  const { categoria: categoriaParam } = useLocalSearchParams<{ categoria?: string }>();

  const [productos, setProductos] = useState<ProductoPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [detalle, setDetalle] = useState<DetallePublico | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setProductos(await catalogoPublicoService.getProductos());
    } catch {
      setError('No pudimos cargar el catálogo. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      if (categoriaParam) {
        setCategoria(categoriaParam);
        router.setParams({ categoria: undefined } as any);
      }
    }, [categoriaParam, router])
  );

  const categorias = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean) as string[])).sort(),
    [productos]
  );

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return productos.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!q || normalizar(`${p.nombre} ${p.categoria ?? ''} ${p.descripcion}`).includes(q))
    );
  }, [productos, busqueda, categoria]);

  const cerrarYIr = (ruta: string) => {
    setDetalle(null);
    router.push(ruta as any);
  };

  return {
    cargando,
    refrescando,
    error,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    categorias,
    filtrados,
    total: productos.length,
    refrescar: async () => {
      setRefrescando(true);
      await cargar();
      setRefrescando(false);
    },
    reintentar: () => {
      setCargando(true);
      cargar();
    },
    limpiar: () => {
      setBusqueda('');
      setCategoria('');
    },
    detalle,
    abrir: (p: ProductoPublico) =>
      setDetalle({
        titulo: p.nombre,
        imagenUrl: p.imagenUrl,
        categoria: p.categoria,
        descripcion: p.descripcion,
        precio: p.precioBase,
        colores: p.colores,
      }),
    cerrar: () => setDetalle(null),
    entrar: () => cerrarYIr('/(auth)/login'),
    registrarse: () => cerrarYIr('/(auth)/register'),
  };
};
