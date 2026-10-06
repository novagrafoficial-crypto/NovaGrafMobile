import apiClient from '../../../data/api/client';
import { User } from '@/types';

export const authApi = {
  // Envía el idToken de Google nativo al endpoint relacional desplegado
  loginWithGoogleMobile: async (idToken: string): Promise<User> => {
    const response = await apiClient.post<User>('/auth/google/mobile', {
      idToken,
    });
    return response.data;
  },
};
