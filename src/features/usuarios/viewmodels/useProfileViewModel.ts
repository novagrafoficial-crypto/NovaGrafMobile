import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';

export const useProfileViewModel = () => {
  const { user, deleteSession } = useAuth();
  const router = useRouter();

  const cerrarSesion = async () => {
    await deleteSession();
    router.replace('/');
  };

  return { user, cerrarSesion };
};
