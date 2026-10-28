import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import type { ClientProduct } from '../models/ClientProduct';
import { clientProductService } from '../services/clientProductService';

export const useClientCatalogViewModel = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(''); // '' = Todo

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      setProducts(await clientProductService.getProducts());
    } catch {
      setError('No se pudo conectar con el servidor para cargar los productos base.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categorias = useMemo(() => {
    const cats = products.map((p) => p.categoria).filter((c): c is string => Boolean(c));
    return Array.from(new Set(cats));
  }, [products]);

  const productosFiltrados = useMemo(() => {
    const txt = busqueda.trim().toLowerCase();
    return products.filter((p) => {
      const coincideTexto =
        !txt ||
        p.producto_nombre.toLowerCase().includes(txt) ||
        (p.descripcion ?? '').toLowerCase().includes(txt);
      const coincideCategoria = !categoriaSeleccionada || p.categoria === categoriaSeleccionada;
      return coincideTexto && coincideCategoria;
    });
  }, [products, busqueda, categoriaSeleccionada]);

  return {
    // Saludo del header (igual que en Inicio)
    primerNombre: user?.nombre?.trim().split(/\s+/)[0] ?? '',
    productosFiltrados,
    categorias,
    loading,
    refreshing,
    error,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    elegirCategoria: setCategoriaSeleccionada,
    // Título de la lista según el filtro activo
    tituloLista: categoriaSeleccionada || 'Todos los productos',
    abrirNotificaciones: () => router.push('/(cliente)/notificaciones' as any),
    abrirProducto: (id: number | string) => router.push(`/(cliente)/producto/${id}` as any),
    reintentar: () => fetchProducts(),
    refrescar: () => fetchProducts(true),
  };
};