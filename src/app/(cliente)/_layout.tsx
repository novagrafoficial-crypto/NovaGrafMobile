import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoleGuard } from '@/shared/components/RoleGuard';
import { brandColors, brandTints } from '@/constants/brand';

const icono = (emoji: string) =>
  function TabIcon({ color }: { color: string }) {
    return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
  };

export default function LayoutCliente() {
  const insets = useSafeAreaInsets();

  return (
    <RoleGuard rol="cliente">
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
        <Tabs.Screen name="inicio" options={{ title: 'Inicio', tabBarIcon: icono('🏠') }} />
        <Tabs.Screen name="productos-base" options={{ title: 'Catálogo', tabBarIcon: icono('📦') }} />
        <Tabs.Screen name="carrito" options={{ title: 'Carrito', tabBarIcon: icono('🛒') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: icono('📋') }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icono('👤') }} />
        {/* Pantalla de detalle: existe como ruta, pero NO debe salir como pestaña */}
        <Tabs.Screen name="producto/[id]" options={{ href: null }} />
      </Tabs>
    </RoleGuard>
  );
}
