import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import { fontFamily, surface, textColors } from '@/constants/theme';
import { Loading } from '@/shared/components/Loading';
import { useAuth } from '@/shared/hooks/useAuth';
import { homeByRole } from '@/shared/utils/roleRoutes';

type NombreIcono = React.ComponentProps<typeof Ionicons>['name'];

const icono = (activo: NombreIcono, inactivo: NombreIcono) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activo : inactivo} size={23} color={color as string} />;
  };

// Parte pública con pestañas abajo (como Mercado Libre o Shein): se puede ver todo sin cuenta.
export default function PublicLayout() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) return <Loading fullScreen />;
  // Si ya hay sesión, va directo a su panel según el rol
  if (user) return <Redirect href={homeByRole(user.rol) as any} />;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColors.primary,
        tabBarInactiveTintColor: textColors.muted,
        tabBarStyle: {
          backgroundColor: surface.card,
          borderTopColor: surface.border,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icono('home', 'home-outline') }} />
      <Tabs.Screen name="catalogo" options={{ title: 'Catálogo', tabBarIcon: icono('grid', 'grid-outline') }} />
      <Tabs.Screen name="nosotros" options={{ title: 'Nosotros', tabBarIcon: icono('business', 'business-outline') }} />
      <Tabs.Screen name="contacto" options={{ title: 'Contacto', tabBarIcon: icono('call', 'call-outline') }} />
      <Tabs.Screen name="cuenta" options={{ title: 'Cuenta', tabBarIcon: icono('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
