import apiClient from './ApiClient';

// OJO: la baseURL (EXPO_PUBLIC_API_URL) ya termina en /api, por eso aquí
// las rutas empiezan en /users/... igual que el login (/users/login).
export const profileApi = {
  getProfile: async (userId: number) => {
    const { data } = await apiClient.get(`/users/profile/${userId}`);
    return data;
  },

  updateProfile: async (userId: number, body: unknown) => {
    const { data } = await apiClient.put(`/users/profile/${userId}`, body);
    return data;
  },

  changePassword: async (userId: number, body: unknown) => {
    const { data } = await apiClient.put(`/users/profile/${userId}/password`, body);
    return data;
  },
};
