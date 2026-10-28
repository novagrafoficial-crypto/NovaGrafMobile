import apiClient from './ApiClient';

export const legalApi = {
  // Las políticas que el admin captura en la web (Empresa → Políticas). Este GET no pide sesión.
  getPoliticas: async () => (await apiClient.get('/admin/politicas')).data,

  // Solicitud de eliminación de cuenta (avisa a los administradores)
  solicitarEliminacion: async (correo: string, motivo: string) =>
    (await apiClient.post('/users/solicitar-eliminacion', { correo, motivo })).data,
};
