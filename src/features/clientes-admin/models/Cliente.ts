export interface Cliente {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  activo: boolean;
  proveedor: string; // 'google' | 'local'
  fecha_registro: string | null;
}