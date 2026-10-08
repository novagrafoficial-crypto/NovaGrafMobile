import type { Rol } from '@/types';

export interface User {
  id_usuario: number;
  nombre: string;
  correo_electronico: string;
  rol: Rol;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
