import apiClient from './ApiClient';


export const adminUsuariosApi = {
    //devuelve todos los usuarios del sistema, sin paginación ni filtros
  getAll: async () => (await apiClient.get('/admin/usuarios')).data,

    cambiarEstado: async (id: number, activo: boolean) =>
    (await apiClient.put(`/admin/usuarios/${id}/activo`, { activo })).data,
};
