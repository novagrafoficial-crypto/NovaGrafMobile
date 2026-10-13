// Una variante (producto + color) que participa en un descuento
export interface VarianteOferta {
  variante_id: number;
  producto_id: number;
  producto_nombre: string;
  sku: string;
  color: string;
  imagen: string | null;
  precio_original: number;
  precio_final: number;
}

// Un descuento activo, con las variantes a las que aplica
export interface Oferta {
  id: number;
  nombre: string;
  tipo: string; // 'porcentaje' | 'fijo'
  valor: number;
  cantidad_minima: number;
  fecha_inicio: string;
  fecha_fin: string;
  variantes: VarianteOferta[];
}

// Una tarjeta de la pantalla: una variante con su descuento, ya lista para dibujar
export interface OfertaTarjeta {
  clave: string;
  productoId: number;
  productoNombre: string;
  color: string;
  imagen: string | null;
  descuentoTexto: string;
  precioOriginal: number;
  precioFinal: number;
  cantidadMinima: number;
  ofertaNombre: string;
}