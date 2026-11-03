import { profileApi } from '@/data/api/profileApi';
import type { ClientProfile, PasswordChangeDTO, PreferenciasPrivacidad } from '../models/ClientProfile';

export const clientProfileService = {
  getProfile: (userId: number): Promise<ClientProfile> => profileApi.getProfile(userId),

  updateProfile: (
    userId: number,
    data: Partial<ClientProfile>
  ): Promise<{ user: ClientProfile; message?: string }> => profileApi.updateProfile(userId, data),

  changePassword: (userId: number, passwords: PasswordChangeDTO): Promise<{ message: string }> =>
    profileApi.changePassword(userId, passwords),

  getPrivacidad: (userId: number): Promise<PreferenciasPrivacidad> => profileApi.getPrivacidad(userId),

  updatePrivacidad: (
    userId: number,
    cambios: Partial<PreferenciasPrivacidad>
  ): Promise<PreferenciasPrivacidad & { message?: string }> => profileApi.updatePrivacidad(userId, cambios),
};
