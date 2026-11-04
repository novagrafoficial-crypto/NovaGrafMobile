import type { Ubicacion } from '../models/Contacto';

// Nombres de Ionicons (antes eran emojis)
const ICONOS_CONTACTO: Record<string, string> = {
  telefono: 'call-outline',
  'teléfono': 'call-outline',
  email: 'mail-outline',
  correo: 'mail-outline',
  whatsapp: 'logo-whatsapp',
  horario: 'time-outline',
};

const ICONOS_RED: Record<string, string> = {
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  twitter: 'logo-twitter',
  x: 'logo-twitter',
  whatsapp: 'logo-whatsapp',
  youtube: 'logo-youtube',
  tiktok: 'logo-tiktok',
  linkedin: 'logo-linkedin',
  pinterest: 'logo-pinterest',
};

export const iconoContacto = (tipo: string) => ICONOS_CONTACTO[tipo.toLowerCase()] ?? 'information-circle-outline';
export const iconoRed = (nombre: string) => ICONOS_RED[nombre.toLowerCase()] ?? 'globe-outline';

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