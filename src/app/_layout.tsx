import { Stack } from 'expo-router';
import { AuthProvider } from '@/shared/providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}
