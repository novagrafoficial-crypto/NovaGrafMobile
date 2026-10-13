import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ClientProduct } from '../models/ClientProduct';
import { clientProductService } from '../services/clientProductService';

export const useClientCatalogViewModel = () => {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de filtros (antes vivía en la vista)
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);

  // Aviso temporal (toast) para la campana de notificaciones
  const [aviso, setAviso] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const avisar = (texto: string) => {
    setAviso(texto);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAviso(null), 2500);
  };

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

  const elegirCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setMenuAbierto(false);
  };

  return {
    productosFiltrados,
    categorias,
    loading,
    refreshing,
    error,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    elegirCategoria,
    menuAbierto,
    alternarMenu: () => setMenuAbierto((v) => !v),
    hayFiltros: busqueda.trim() !== '' || categoriaSeleccionada !== '',
    aviso,
    abrirNotificaciones: () => avisar('Las notificaciones estarán disponibles pronto.'),
    reintentar: () => fetchProducts(),
    refrescar: () => fetchProducts(true),
  };
};