// Un trabajo (producto personalizado) publicado en el portafolio de Nova Graf.
export interface PortfolioItem {
  id: number;
  productoId: number | null;
  descripcion: string | null;
  imagenUrl: string | null;
  productoNombre: string | null;
  categoriaNombre: string | null;
  precioBase: number | null;
}
