import apiClient from '@/data/api/client';
import { User } from '@/types';

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post<User>('/auth/login', { email, password });
    return response.data;
  }
};
