import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { surface } from '@/constants/theme';
import { MenuLateral, MenuPublicoProvider } from '@/features/menu-publico';
import { Loading } from '@/shared/components/Loading';
import { useAuth } from '@/shared/hooks/useAuth';
import { homeByRole } from '@/shared/utils/roleRoutes';

// Parte pública con menú lateral (☰)
export default function PublicLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading fullScreen />;
  // Si ya hay sesión, va directo a su panel según el rol
  if (user) return <Redirect href={homeByRole(user.rol) as any} />;

  return (
    <MenuPublicoProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: surface.screen } }} />
        <MenuLateral />
      </View>
    </MenuPublicoProvider>
  );
}
