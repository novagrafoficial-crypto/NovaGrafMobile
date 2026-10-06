// src/app/index.tsx
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/shared/hooks/useSession';
import { brandColors } from '@/constants/brand';

export default function Index() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('(auth)/login'); 
    } else if (user.role === 'client') {
      router.replace('(client)/home');
    } else if (user.role === 'admin') {
      router.replace('(admin)/dashboard');
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: brandColors.background }}>
      <ActivityIndicator size="large" color={brandColors.primary} />
    </View>
  );
}
