import { useState, useEffect, useMemo, useCallback } from 'react';
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
    reintentar: () => fetchProducts(),
    refrescar: () => fetchProducts(true),
  };
};
