// Fila de GET /admin/pedidos y encabezado de GET /admin/pedidos/:id
export interface PedidoResumen {
  id: number;
  fecha_pedido: string;
  estado: string;
  total_general: number;
  monto_anticipo: number;
  monto_restante: number;
  direccion_envio: string | null;
  cliente_nombre: string;
  cliente_correo: string;
  metodo_entrega: string | null;
  metodo_pago: string | null;
}

export interface PedidoProducto {
  producto_nombre: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  // Opcionales: solo llegan si el SELECT del backend los incluye.
  color: string | null;
  imagen_url: string | null;
  descripcion: string | null;
}

export interface PagoAdmin {
  id: number;
  tipo_pago: string;
  monto: number;
  estado_pago: string; // PENDIENTE | APROBADO | RECHAZADO
  comprobante_url: string | null;
  notas_admin: string | null;
  fecha_pago: string | null;
}

export interface PreviaAdmin {
  id: number;
  numero_previa: number;
  imagen_url: string;
  aprobada: boolean;
  rechazada: boolean;
  fecha_subida: string | null;
  fecha_vista: string | null; // cuándo la abrió el cliente
  fecha_aprobacion: string | null;
  /** Lo que escribió el cliente al pedir cambios */
  comentario_cliente: string | null;
}

export interface DisenoCliente {
  id: number;
  tipo_origen: string;
  notas_cliente: string | null;
  archivo_url: string | null;
  fecha_envio: string | null;
  usaSimulador: boolean;
}

// El chat del pedido va en su propio módulo (HU-20).
export interface PedidoCompleto {
  pedido: PedidoResumen;
  productos: PedidoProducto[];
  pagos: PagoAdmin[];
  previas: PreviaAdmin[];
  disenos: DisenoCliente[];
}

// Imagen elegida de la galería para enviar como previa.
export interface ArchivoPrevia {
  uri: string;
  name: string;
  mimeType: string;
}

// Qué elemento del pedido se está viendo en la hoja de detalle.
export type DetalleSeleccionado =
  | { tipo: 'producto'; item: PedidoProducto }
  | { tipo: 'diseno'; item: DisenoCliente }
  | { tipo: 'comprobante'; item: PagoAdmin }
  | { tipo: 'previa'; item: PreviaAdmin };
