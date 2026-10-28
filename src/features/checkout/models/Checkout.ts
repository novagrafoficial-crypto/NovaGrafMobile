export type CategoriaKey = 'TIENDA' | 'PUNTO_MEDIO' | 'ENVIO_LOCAL';
export type TipoEntrega = 'RECOGIDA_FISICA' | 'PUNTO_MEDIO' | 'ENVIO_LOCAL';
export type IconoNombre = 'storefront-outline' | 'location-outline' | 'bicycle-outline';

export interface OpcionEntrega {
  id: number;
  tipo: TipoEntrega;
  nombre: string;
  descripcion: string | null;
  costo: number;
}

export interface MetodoPago {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  requiere_comprobante: boolean;
}

export interface CheckoutOptions {
  tiendas: OpcionEntrega[];
  puntosMedios: OpcionEntrega[];
  colonias: OpcionEntrega[];
  metodosPago: MetodoPago[];
}

export interface NuevoPedido {
  metodo_entrega_id: number;
  metodo_pago_id: number;
  direccion_envio: string;
}

export interface CategoriaEntrega {
  key: CategoriaKey;
  label: string;
  icono: IconoNombre;
  opciones: OpcionEntrega[];
}

export const CATEGORIAS_BASE: { key: CategoriaKey; label: string; icono: IconoNombre }[] = [
  { key: 'TIENDA', label: 'En tienda', icono: 'storefront-outline' },
  { key: 'PUNTO_MEDIO', label: 'Punto medio', icono: 'location-outline' },
  { key: 'ENVIO_LOCAL', label: 'A domicilio', icono: 'bicycle-outline' },
];
export const PASOS_CHECKOUT = ['Compra', 'Entrega', 'Pago', 'Confirmar'] as const;