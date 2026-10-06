import apiClient from '@/data/api/client';
import { User } from '@/types';

interface LoginResponse {
  message: string;
  user: {
    id_usuario: number;
    nombre: string;
    correo_electronico: string;
    rol: 'admin' | 'client';
  };
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<LoginResponse>('/api/users/login', { email, password });
    const { user, token } = response.data;
    return {
      id: String(user.id_usuario),
      email: user.correo_electronico,
      role: user.rol,
      token,
    };
  }
};