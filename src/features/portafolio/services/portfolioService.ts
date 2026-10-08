import { portfolioApi } from '@/data/api/portfolioApi';
import { API_URL } from '@/constants/app';
import type { PortfolioItem } from '../models/PortfolioItem';

// PostgreSQL devuelve los NUMERIC como texto ("150.00"), aquí los volvemos número.
const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

// Devuelve el primer campo que exista (soporta snake_case y camelCase).
const pick = (row: any, ...keys: string[]) => {
  for (const k of keys) {
    if (row?.[k] !== undefined && row[k] !== null) return row[k];
  }
  return null;
};

// Si la imagen viene como ruta relativa, la pega al host del backend.
const resolveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (/^(https?:|data:)/i.test(url)) return url;
  const origin = (API_URL ?? '').replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const extractRows = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  return data?.portafolio ?? data?.data ?? data?.items ?? [];
};

const toPortfolioItem = (row: any): PortfolioItem => ({
  id: row.id,
  productoId: pick(row, 'producto_id', 'productoId'),
  descripcion: pick(row, 'descripcion'),
  imagenUrl: resolveImageUrl(pick(row, 'imagen_url', 'imagenUrl', 'imagen')),
  productoNombre: pick(row, 'producto_nombre', 'productoNombre'),
  categoriaNombre: pick(row, 'categoria_nombre', 'categoriaNombre'),
  precioBase: toNumber(pick(row, 'precio_base', 'precioBase')),
});

export const portfolioService = {
  getAll: async (): Promise<PortfolioItem[]> => {
    const data = await portfolioApi.getAll();
    if (__DEV__) console.log('[portafolio] respuesta:', JSON.stringify(data)?.slice(0, 500));
    return extractRows(data).map(toPortfolioItem);
  },
  getPublic: async (): Promise<PortfolioItem[]> => {
    const data = await portfolioApi.getPublic();
    if (__DEV__) console.log('[portafolio público] respuesta:', JSON.stringify(data)?.slice(0, 500));
    return extractRows(data).map(toPortfolioItem);
  },
};
