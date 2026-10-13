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
}

export interface Cart {
  items: CartItem[];
  total: number;
}