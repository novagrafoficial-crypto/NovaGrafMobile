import apiClient from './ApiClient';

export const portfolioApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/client/portafolio');
    return data; 
  },
  
  getPublic: async () => {
    const { data } = await apiClient.get('/public/portafolio');
    return data; 
  },
};
