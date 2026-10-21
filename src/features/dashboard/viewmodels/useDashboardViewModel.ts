import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { getInitials } from '@/shared/utils/getInitials';

// Inicio del administrador: solo muestra quién es (sin estadísticas ni accesos de ejemplo).
export const useDashboardViewModel = () => {
  const { user } = useAuth();
  const router = useRouter();

  return {
    nombre: user?.nombre ?? '',
    correo: user?.correo_electronico ?? '',
    iniciales: getInitials(user?.nombre),
    irAPerfil: () => router.push('/(admin)/perfil-admin' as any),
  };
};
