// Respuesta de GET /users/profile/:id (el mismo endpoint sirve a cliente y admin).
export interface AdminProfile {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  proveedor: string; // 'google' | 'local'
}

// Campos editables. El backend exige nombre, apellido_paterno y nombre_usuario.
export interface AdminProfileForm {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_usuario: string;
  telefono: string;
}

export interface PasswordChange {
  actual: string;
  nueva: string;
}
