import { brandColors } from "@/constants/brand";
import { fontWeight, surface, textColors } from "@/constants/theme";
import { useCart } from "@/features/carrito";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Ícono de la barra inferior: relleno cuando la pestaña está activa, de línea cuando no.
const icono = (activo: IconName, inactivo: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activo : inactivo} size={24} color={color as string} />;
  };

export default function LayoutCliente() {
  const insets = useSafeAreaInsets();
  const { count } = useCart();

  return (
    <RoleGuard rol="cliente">
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          // Negro para la pestaña activa y gris para las demás (sin colores)
          tabBarActiveTintColor: textColors.primary,
          tabBarInactiveTintColor: textColors.muted,
          tabBarStyle: {
            backgroundColor: surface.card,
            borderTopColor: surface.border,
            borderTopWidth: 1,
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom + 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: fontWeight.semibold }, // 11 es el mínimo legible para etiquetas de pestañas
          tabBarItemStyle: { paddingVertical: 2 },
        }}
      >
        <Tabs.Screen
          name="inicio"
          options={{ title: "Inicio", tabBarIcon: icono("home", "home-outline") }}
        />
        <Tabs.Screen
          name="productos-base"
          options={{ title: "Categorías", tabBarIcon: icono("grid", "grid-outline") }}
        />
        <Tabs.Screen
          name="carrito"
          options={{
            title: "Carrito",
            tabBarIcon: icono("cart", "cart-outline"),
            // Numerito con la cantidad de productos, igual que el header de la web
            tabBarBadge: count > 0 ? count : undefined,
            tabBarBadgeStyle: {
              backgroundColor: brandColors.primary,
              color: brandColors.white,
              fontSize: 11,
              fontWeight: "700",
            },
          }}
        />

        <Tabs.Screen
          name="pedidos"
          options={{ title: "Pedidos", tabBarIcon: icono("receipt", "receipt-outline") }}
        />
        <Tabs.Screen
          name="perfil"
          options={{ title: "Perfil", tabBarIcon: icono("person", "person-outline") }}
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
        <Tabs.Screen
          name="pago-final/[id]"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen
          name="chat-pedido/[id]"
          options={{ href: null, tabBarStyle: { display: "none" } }}
        />
        <Tabs.Screen name="notificaciones" options={{ href: null }} />
      </Tabs>
    </RoleGuard>
  );
}