import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { CartProvider } from '@/features/carrito';
import { NotificacionesProvider } from '@/features/notificaciones'; 
import { brandColors } from '@/constants/brand';

// Mantiene la pantalla de carga hasta que la tipografía esté lista (evita que el texto "brinque")
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fuentesListas || errorFuentes) SplashScreen.hideAsync().catch(() => {});
  }, [fuentesListas, errorFuentes]);

  // Si la fuente falla, la app sigue con la fuente del sistema
  if (!fuentesListas && !errorFuentes) return null;

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