import { ofertasApi } from '@/data/api/ofertasApi';
import { resolveImageUrl } from '@/shared/utils/resolveImageUrl';
import type { Oferta, VarianteOferta } from '../models/Oferta';

// PostgreSQL manda los NUMERIC como texto ("150.00"): aquí los volvemos número.
const aNumero = (v: unknown, defecto = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? defecto : n;
};

// El backend usa '/default-product.jpg' cuando no hay foto: la tratamos como "sin imagen"
const aImagen = (v: unknown): string | null => {
  const texto = typeof v === 'string' ? v : '';
  if (!texto || texto.includes('default-product')) return null;
  return resolveImageUrl(texto);
};

const aVariante = (v: any): VarianteOferta => ({
  variante_id: aNumero(v.variante_id),
  producto_id: aNumero(v.producto_id),
  producto_nombre: String(v.producto_nombre ?? ''),
  sku: String(v.sku ?? ''),
  color: String(v.color ?? ''),
  imagen: aImagen(v.imagen),
  precio_original: aNumero(v.precio_original),
  precio_final: aNumero(v.precio_final),
});

const aOferta = (o: any): Oferta => ({
  id: aNumero(o.id),
  nombre: String(o.nombre ?? ''),
  tipo: String(o.tipo ?? '').toLowerCase(),
  valor: aNumero(o.valor),
  cantidad_minima: aNumero(o.cantidad_minima, 1),
  fecha_inicio: String(o.fecha_inicio ?? ''),
  fecha_fin: String(o.fecha_fin ?? ''),
  variantes: Array.isArray(o.variantes) ? o.variantes.map(aVariante) : [],
});

export const ofertasService = {
  // Acepta un arreglo directo o { ofertas | data: [...] }, según cómo responda tu controlador
  getOfertas: async (): Promise<Oferta[]> => {
    const data = await ofertasApi.getOfertas();
    const filas = Array.isArray(data) ? data : data?.ofertas ?? data?.data ?? [];
    return Array.isArray(filas) ? filas.map(aOferta) : [];
  },
};