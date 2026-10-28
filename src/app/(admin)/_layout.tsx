import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brandColors } from '@/constants/brand';
import { fontFamily, surface, textColors } from '@/constants/theme';
import { NotificacionesAdminProvider, useNotificacionesAdmin } from '@/features/notificaciones-admin';
import { RoleGuard } from '@/shared/components/RoleGuard';

type NombreIcono = React.ComponentProps<typeof Ionicons>['name'];

// Ícono relleno cuando la pestaña está activa y de contorno cuando no.
const icono = (activo: NombreIcono, inactivo: NombreIcono) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activo : inactivo} size={23} color={color as string} />;
  };

function TabsAdmin() {
  const insets = useSafeAreaInsets();
  // Número de notificaciones sin leer: se muestra como badge en la pestaña "Avisos".
  const { noLeidas } = useNotificacionesAdmin();

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
      <Tabs.Screen name="dashboard" options={{ title: 'Inicio', tabBarIcon: icono('grid', 'grid-outline') }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: icono('receipt', 'receipt-outline') }} />
      {/* El archivo sigue siendo usuarios.tsx; solo cambia el título de la pestaña. */}
      <Tabs.Screen name="usuarios" options={{ title: 'Clientes', tabBarIcon: icono('people', 'people-outline') }} />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Avisos',
          tabBarIcon: icono('notifications', 'notifications-outline'),
          tabBarBadge: noLeidas > 0 ? (noLeidas > 99 ? '99+' : noLeidas) : undefined,
          tabBarBadgeStyle: { backgroundColor: brandColors.error, color: '#FFFFFF', fontSize: 10 },
        }}
      />
      {/* El archivo es perfil-admin.tsx: el name debe coincidir con él. */}
      <Tabs.Screen name="perfil-admin" options={{ title: 'Perfil', tabBarIcon: icono('person-circle', 'person-circle-outline') }} />

      {/* Rutas que existen pero no son pestañas */}
      <Tabs.Screen name="productos" options={{ href: null }} />
      <Tabs.Screen name="pedido/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default function LayoutAdmin() {
  return (
    // Solo el rol administrador entra aquí; un cliente es redirigido a su inicio.
    <RoleGuard rol="administrador">
      {/* El provider vive aquí (no en el layout raíz) para que solo exista en el panel admin. */}
      <NotificacionesAdminProvider>
        <TabsAdmin />
      </NotificacionesAdminProvider>
    </RoleGuard>
  );
}
