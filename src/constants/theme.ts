// ─────────────────────────────────────────────────────────────
// Guía visual de NovaGraf para el móvil.
// Textos en negro/gris oscuro (más legibles) y la marca solo para acentos.
// ─────────────────────────────────────────────────────────────
import { brandColors } from './brand';

/** Colores de TEXTO. La marca (teal) se reserva para acentos, no para párrafos. */
export const textColors = {
  primary: '#111111',   // títulos y datos importantes
  secondary: '#3F3F46', // texto normal
  muted: '#71717A',     // etiquetas, fechas, ayudas
  inverse: '#FFFFFF',   // texto sobre fondos oscuros
  link: brandColors.primary,
};

/** Superficies y bordes neutros. */
export const surface = {
  screen: '#F4F4F2', // fondo de pantalla (más limpio que el gris de marca)
  card: '#FFFFFF',
  muted: '#F4F4F5',
  border: '#E4E4E7',
};

/**
 * Tamaños de letra (escala basada en Material 3 / Apple HIG).
 * Nunca menos de 12 para que siga siendo legible.
 */
export const fontSize = {
  caption: 12,  // fechas, contadores
  small: 13,    // etiquetas secundarias
  body: 15,     // texto normal
  bodyLg: 16,   // texto destacado, botones
  title: 18,    // título de tarjeta
  headline: 22, // folio / título de pantalla
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/** Espaciado en múltiplos de 4. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

/** Tamaño de íconos. */
export const iconSize = { sm: 16, md: 20, lg: 24 };