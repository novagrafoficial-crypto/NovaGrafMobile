import apiClient from './ApiClient';

// Catálogo sin sesión (el mismo que usa la web pública: Home.jsx).
export const publicCatalogApi = {
  getCatalogo: async () => (await apiClient.get('/public/productos/catalogo')).data,
};
