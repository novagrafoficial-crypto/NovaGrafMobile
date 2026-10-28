// Producto del catálogo público, ya limpio (precio como número e imagen con URL completa).
export interface ProductoPublico {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  imagenUrl: string | null;
  categoria: string | null;
  colores: string[];
}

// Lo que se muestra en la hoja de detalle: puede ser un producto o un trabajo del portafolio.
export interface DetallePublico {
  titulo: string;
  imagenUrl: string | null;
  categoria: string | null;
  descripcion: string | null;
  /** null en los trabajos del portafolio */
  precio: number | null;
  colores: string[];
}
