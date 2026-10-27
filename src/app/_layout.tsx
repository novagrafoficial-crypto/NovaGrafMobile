import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { CartProvider } from '@/features/carrito';
import { NotificacionesProvider } from '@/features/notificaciones'; 
import { brandColors } from '@/constants/brand';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificacionesProvider>
        {/* Iconos de la barra de estado en blanco: combinan con el header oscuro de marca */}
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            // Color de fondo de TODA pantalla (evita el flash blanco al navegar)
            contentStyle: { backgroundColor: brandColors.background },
          }}
        >
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(cliente)" />
          <Stack.Screen name="(admin)" />
        </Stack>
       </NotificacionesProvider>
       </CartProvider>
    </AuthProvider>
  );
}
