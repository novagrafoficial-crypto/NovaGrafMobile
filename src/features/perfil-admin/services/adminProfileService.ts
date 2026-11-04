import { profileApi } from '@/data/api/profileApi';
import type { AdminProfile, AdminProfileForm, PasswordChange } from '../models/AdminProfile';

// Adapter: respuesta del backend -> nuestro modelo (los campos opcionales llegan null).
const aPerfil = (r: any): AdminProfile => ({
  id_usuario: Number(r.id_usuario),
  nombre: r.nombre ?? '',
  apellido_paterno: r.apellido_paterno ?? '',
  apellido_materno: r.apellido_materno ?? '',
  nombre_usuario: r.nombre_usuario ?? '',
  correo_electronico: r.correo_electronico ?? '',
  telefono: r.telefono ?? '',
  proveedor: r.proveedor ?? 'local',
});

export const adminProfileService = {
  getProfile: async (userId: number): Promise<AdminProfile> =>
    aPerfil(await profileApi.getProfile(userId)),

  // El PUT no devuelve el perfil completo, así que se vuelve a consultar.
  updateProfile: async (userId: number, form: AdminProfileForm): Promise<AdminProfile> => {
    await profileApi.updateProfile(userId, form);
    return aPerfil(await profileApi.getProfile(userId));
  },

  changePassword: (userId: number, body: PasswordChange): Promise<{ message: string }> =>
    profileApi.changePassword(userId, body),
};
