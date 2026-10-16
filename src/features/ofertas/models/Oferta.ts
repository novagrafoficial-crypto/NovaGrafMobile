
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

// Un descuento activo
export interface Oferta {
  id: number;
  nombre: string;
  tipo: string; 
  valor: number;
  cantidad_minima: number;
  fecha_inicio: string;
  fecha_fin: string;
  variantes: VarianteOferta[];
}

// Una tarjeta de la pantalla:
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