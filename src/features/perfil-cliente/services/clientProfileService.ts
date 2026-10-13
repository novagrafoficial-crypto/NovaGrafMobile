import { profileApi } from '@/data/api/profileApi';
import type { ClientProfile, PasswordChangeDTO } from '../models/ClientProfile';

export const clientProfileService = {
  getProfile: (userId: number): Promise<ClientProfile> => profileApi.getProfile(userId),

  updateProfile: (
    userId: number,
    data: Partial<ClientProfile>
  ): Promise<{ user: ClientProfile; message?: string }> => profileApi.updateProfile(userId, data),

  changePassword: (userId: number, passwords: PasswordChangeDTO): Promise<{ message: string }> =>
    profileApi.changePassword(userId, passwords),
};
