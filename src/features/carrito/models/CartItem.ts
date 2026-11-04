// Un renglón del carrito, ya con números (PostgreSQL manda los precios como texto).
export interface CartItem {
  detalle_id: number;
  variante_id: number;
  producto_id: number;
  producto_nombre: string;
  color: string | null;
  imagen_url: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  precio_original: number;
  descuento_nombre: string | null;
  ahorro: number;
  descuento_pendiente: { nombre: string; cantidad_minima: number; faltan: number } | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
  ahorro: number;
}