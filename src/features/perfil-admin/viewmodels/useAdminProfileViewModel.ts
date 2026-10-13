import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';

export const useAdminProfileViewModel = () => {
  const { user, deleteSession } = useAuth();
  const router = useRouter();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const confirmarLogout = async () => {
    setLogoutVisible(false);
    await deleteSession();
    router.replace('/' as any);
  };

  return {
    user,
    logoutVisible,
    pedirLogout: () => setLogoutVisible(true),
    cancelarLogout: () => setLogoutVisible(false),
    confirmarLogout,
  };
};
