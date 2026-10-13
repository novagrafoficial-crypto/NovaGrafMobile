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