export interface Atributo {
  tipo: string;
  valor: string;
}

export interface Variante {
  variante_id: number | string;
  color: string;
  precio_adicional: number;
  imagen_url: string;
  atributos?: Atributo[];
}

export interface PortafolioReferencia {
  id: number | string;
  imagen_url: string;
  descripcion?: string;
}

export interface ClientProductDetail {
  producto_id: number | string;
  producto_nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  material?: string;
  variantes: Variante[];
}