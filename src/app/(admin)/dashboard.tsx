import { View, Text, Button } from 'react-native';
import { useSession } from '@/shared/hooks/useSession';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { deleteSession } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await deleteSession();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0A2B2C', marginBottom: 20 }}>
        Panel de Administrador (Vista de Prueba)
      </Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} color="#C0392B" />
    </View>
  );
}
