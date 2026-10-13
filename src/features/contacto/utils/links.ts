import type { Ubicacion } from '../models/Contacto';

const ICONOS_CONTACTO: Record<string, string> = {
  telefono: '📞',
  'teléfono': '📞',
  email: '✉️',
  correo: '✉️',
  whatsapp: '💬',
  horario: '🕒',
};

const ICONOS_RED: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  twitter: '🐦',
  whatsapp: '💬',
  youtube: '📺',
  tiktok: '🎵',
  linkedin: '🔗',
};

export const iconoContacto = (tipo: string) => ICONOS_CONTACTO[tipo.toLowerCase()] ?? '📌';
export const iconoRed = (nombre: string) => ICONOS_RED[nombre.toLowerCase()] ?? '🌐';

export const capitalizar = (texto: string) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;

// Si la URL no trae http(s), se lo agregamos para que el teléfono pueda abrirla
export const formatUrl = (url: string): string => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

// Convierte un contacto en el enlace que abre la app correcta del teléfono
export const contactoHref = (tipo: string, valor: string): string | null => {
  const t = tipo.toLowerCase();
  if (t === 'email' || t === 'correo') return `mailto:${valor}`;
  if (t === 'telefono' || t === 'teléfono') return `tel:${valor.replace(/\s+/g, '')}`;
  if (t === 'whatsapp') return `https://wa.me/${valor.replace(/\D/g, '')}`;
  return null;
};

export const mapsHref = (u: Ubicacion): string | null => {
  const consulta = [u.direccion, u.ciudad, u.estado, u.pais].filter(Boolean).join(', ');
  return consulta ? `https://maps.google.com/?q=${encodeURIComponent(consulta)}` : null;
};