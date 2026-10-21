import { brandColors, brandTints } from '@/constants/brand';
import { RoleGuard } from '@/shared/components/RoleGuard';
import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icono = (emoji: string) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
  };

export default function LayoutAdmin() {
  const insets = useSafeAreaInsets();

  return (
    // Solo el rol administrador entra aquí; un cliente es redirigido a su inicio.
    <RoleGuard rol="administrador">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: brandColors.primary,
          tabBarInactiveTintColor: brandTints.textMuted,
          tabBarStyle: {
            backgroundColor: brandColors.white,
            borderTopColor: brandTints.border,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 4,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Inicio', tabBarIcon: icono('📊') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: icono('📋') }} />
        {/* El archivo sigue siendo usuarios.tsx; solo cambia el título de la pestaña. */}
        <Tabs.Screen name="usuarios" options={{ title: 'Clientes', tabBarIcon: icono('👥') }} />
        {/* El archivo es perfil-admin.tsx: el name debe coincidir con él. */}
        <Tabs.Screen name="perfil-admin" options={{ title: 'Perfil', tabBarIcon: icono('👤') }} />

        {/* Rutas que existen pero no son pestañas */}
        <Tabs.Screen name="productos" options={{ href: null }} />
        <Tabs.Screen name="pedido/[id]" options={{ href: null }} />
      </Tabs>
    </RoleGuard>
  );
}