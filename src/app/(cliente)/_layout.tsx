import { brandColors, brandTints } from "@/constants/brand";
import { useCart } from "@/features/carrito";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icono = (emoji: string) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
  };

export default function LayoutCliente() {
  const insets = useSafeAreaInsets();
  const { count } = useCart();

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
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: -2 },
        }}
      >
        <Tabs.Screen
          name="inicio"
          options={{ title: "Inicio", tabBarIcon: icono("🏠") }}
        />
        <Tabs.Screen
          name="productos-base"
          options={{ title: "Categorías", tabBarIcon: icono("📦") }}
        />
        <Tabs.Screen
          name="carrito"
          options={{
            title: "Carrito",
            tabBarIcon: icono("🛒"),
            // El numerito rojo/verde sobre el icono, igual que el header de la web
            tabBarBadge: count > 0 ? count : undefined,
            tabBarBadgeStyle: {
              backgroundColor: brandColors.accent,
              color: brandColors.white,
            },
          }}
        />

        <Tabs.Screen
          name="pedidos"
          options={{ title: "Pedidos", tabBarIcon: icono("📋") }}
        />
        <Tabs.Screen
          name="perfil"
          options={{ title: "Perfil", tabBarIcon: icono("👤") }}
        />
        <Tabs.Screen name="producto/[id]" options={{ href: null }} />
        <Tabs.Screen
          name="checkout"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="pago-pedido/[id]"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen name="pedido/[id]" options={{ href: null }} />
        <Tabs.Screen
          name="diseno-pedido/[id]"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen name="notificaciones" options={{ href: null }} /> 
      </Tabs>
    </RoleGuard>
  );
}
