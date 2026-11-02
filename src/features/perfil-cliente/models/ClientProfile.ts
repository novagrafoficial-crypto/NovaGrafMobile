export interface ClientProfile {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nombre_usuario: string;
  correo_electronico: string;
  fecha_nacimiento?: string;
  domicilio?: string;
  telefono?: string;
  proveedor?: 'google' | 'local' | string;
}

export interface PasswordChangeDTO {
  actual: string;
  nueva: string;
}

/** Derecho ARCO de Oposición: el cliente puede desactivar el uso de sus datos para avisos. */
export interface PreferenciasPrivacidad {
  /** Recibir avisos en la app (mensajes y previas de sus pedidos) */
  recibe_avisos: boolean;
}
