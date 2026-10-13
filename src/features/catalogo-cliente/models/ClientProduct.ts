export interface ClientProduct {
  producto_id: string | number;
  producto_nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  categoria?: string;
  subcategoria?: string;
  colores_disponibles?: string[];
  colores_imagenes?: Array<{ color: string; imagen_url: string }>;
}