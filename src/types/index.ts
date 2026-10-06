export interface User {
  id_usuario: number;
  nombre: string;
  correo_electronico: string;
  rol: 'admin' | 'client';
  token?: string; // Token JWT firmado por tu servidor
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
