import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { surface } from '@/constants/theme';
import { MenuAdmin, MenuAdminProvider } from '@/features/menu-admin';
import { NotificacionesAdminProvider } from '@/features/notificaciones-admin';
import { RoleGuard } from '@/shared/components/RoleGuard';

// Panel del administrador con MENÚ LATERAL (☰)
function PanelAdmin() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        backBehavior="history"
        tabBar={() => null}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: surface.screen } }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="pedidos" />
        <Tabs.Screen name="usuarios" />
        <Tabs.Screen name="notificaciones" />
        <Tabs.Screen name="perfil-admin" />
        <Tabs.Screen name="productos" />
        <Tabs.Screen name="pedido/[id]" />
      </Tabs>
      <MenuAdmin />
    </View>
  );
}

export default function LayoutAdmin() {
  return (
    // Solo el rol administrador entra aquí; un cliente es redirigido a su inicio.
    <RoleGuard rol="administrador">
  
      <NotificacionesAdminProvider>
        <MenuAdminProvider>
          <PanelAdmin />
        </MenuAdminProvider>
      </NotificacionesAdminProvider>
    </RoleGuard>
  );
}
