import { publicCatalogApi } from '@/data/api/publicCatalogApi';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import type { ProductoPublico } from '../models/ProductoPublico';

// Adapter: fila del backend → ProductoPublico
const aProducto = (r: any): ProductoPublico => ({
  id: Number(r.producto_id ?? r.id),
  nombre: r.producto_nombre ?? r.nombre ?? '',
  descripcion: r.descripcion ?? '',
  precioBase: Number(r.precio_base ?? 0),
  imagenUrl:
    resolveImageUrl(r.imagen_url) ??
    resolveImageUrl(Array.isArray(r.colores_imagenes) ? r.colores_imagenes.find((c: any) => c?.imagen_url)?.imagen_url : null),
  categoria: r.categoria ?? null,
  colores: Array.isArray(r.colores_disponibles) ? r.colores_disponibles.filter(Boolean) : [],
});

export const catalogoPublicoService = {
  getProductos: async (): Promise<ProductoPublico[]> => {
    const data = await publicCatalogApi.getCatalogo();
    const filas = Array.isArray(data) ? data : data?.productos ?? [];
    return filas.map(aProducto);
  },
};
