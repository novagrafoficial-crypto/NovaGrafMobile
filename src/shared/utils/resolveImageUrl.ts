import { API_URL } from '@/constants/app';

// Si la imagen viene como ruta relativa (/uploads/...), la pega al host del backend.
export const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (/^(https?:|data:)/i.test(url)) return url;
  const origin = (API_URL ?? '').replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};