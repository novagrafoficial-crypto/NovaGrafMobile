// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { SessionProvider } from '@/shared/providers/SessionProvider';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </SessionProvider>
  );
}
